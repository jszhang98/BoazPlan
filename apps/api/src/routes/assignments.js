import { PrismaClient } from '@prisma/client';
import { sendNotification } from '../services/notifications.js';

const prisma = new PrismaClient();

const VALID_STATUS = ['pending', 'accepted', 'declined', 'completed'];

const VOLUNTEER_SELECT = { id: true, displayName: true, email: true };

export default async function assignmentRoutes(fastify) {
  // POST /api/v1/requests/:id/assignments — assign a volunteer to a request
  fastify.post('/api/v1/requests/:id/assignments', async (req, reply) => {
    const { id: requestId } = req.params;
    const { volunteerId, note } = req.body || {};

    if (!volunteerId) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'volunteerId is required' } });
    }

    // Verify request exists
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    // Verify volunteer exists
    const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
    if (!volunteer) return reply.status(404).send({ error: { code: 'not_found', message: 'volunteer not found' } });

    try {
      const assignment = await prisma.volunteerAssignment.create({
        data: { requestId, volunteerId, note: note || null },
        include: { volunteer: { select: VOLUNTEER_SELECT } },
      });

      // Transition request to "assigned" if it was open
      if (request.status === 'open') {
        await prisma.request.update({ where: { id: requestId }, data: { status: 'assigned' } });
      }

      // Notify request author (FR14: notify on assignment event)
      if (request.authorId) {
        sendNotification(request.authorId, {
          type: 'assignment_created',
          title: 'A volunteer has been matched to your request',
          body: `Someone has offered to help with: "${request.title}"`,
          metadata: { requestId, assignmentId: assignment.id },
        }).catch(() => {});
      }

      return reply.status(201).send({ data: assignment });
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'conflict', message: 'volunteer already assigned to this request' } });
      }
      throw err;
    }
  });

  // GET /api/v1/requests/:id/assignments — list all assignments for a request
  fastify.get('/api/v1/requests/:id/assignments', async (req, reply) => {
    const { id: requestId } = req.params;

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    const assignments = await prisma.volunteerAssignment.findMany({
      where: { requestId },
      include: { volunteer: { select: VOLUNTEER_SELECT } },
      orderBy: { createdAt: 'asc' },
    });

    return { data: assignments };
  });

  // PATCH /api/v1/requests/:id/assignments/:aid — volunteer responds or completes
  fastify.patch('/api/v1/requests/:id/assignments/:aid', async (req, reply) => {
    const { id: requestId, aid } = req.params;
    const { status, note } = req.body || {};

    if (status && !VALID_STATUS.includes(status)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `status must be one of: ${VALID_STATUS.join(', ')}` } });
    }

    try {
      const assignment = await prisma.volunteerAssignment.update({
        where: { id: aid },
        data: {
          ...(status !== undefined && { status }),
          ...(note   !== undefined && { note }),
        },
        include: { volunteer: { select: VOLUNTEER_SELECT } },
      });

      // Sync request status based on assignment outcome
      if (status === 'completed') {
        await prisma.request.update({ where: { id: requestId }, data: { status: 'resolved' } });
      } else if (status === 'declined') {
        // Check if any other assignment is still active
        const active = await prisma.volunteerAssignment.findFirst({
          where: { requestId, status: { in: ['pending', 'accepted'] }, NOT: { id: aid } },
        });
        if (!active) {
          await prisma.request.update({ where: { id: requestId }, data: { status: 'open' } });
        }
      }

      // Notify request author about the status change (FR14)
      if (status && ['accepted', 'declined', 'completed'].includes(status)) {
        const request = await prisma.request.findUnique({ where: { id: requestId } });
        if (request?.authorId) {
          const messages = {
            accepted:  { title: 'Your volunteer has confirmed they can help', body: `A volunteer accepted your request: "${request.title}"` },
            declined:  { title: 'A volunteer was unable to help', body: `Your request "${request.title}" is back in the queue.` },
            completed: { title: 'Your request has been resolved', body: `Great news — your request "${request.title}" has been marked complete.` },
          };
          sendNotification(request.authorId, {
            type: 'assignment_updated',
            ...messages[status],
            metadata: { requestId, assignmentId: aid, newStatus: status },
          }).catch(() => {});
        }
      }

      return { data: assignment };
    } catch (err) {
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'not_found', message: 'assignment not found' } });
      throw err;
    }
  });

  // DELETE /api/v1/requests/:id/assignments/:aid — unassign
  fastify.delete('/api/v1/requests/:id/assignments/:aid', async (req, reply) => {
    const { id: requestId, aid } = req.params;

    try {
      await prisma.volunteerAssignment.delete({ where: { id: aid } });

      // Revert request status if no active assignments remain
      const remaining = await prisma.volunteerAssignment.count({
        where: { requestId, status: { in: ['pending', 'accepted'] } },
      });
      if (remaining === 0) {
        const request = await prisma.request.findUnique({ where: { id: requestId } });
        if (request?.status === 'assigned') {
          await prisma.request.update({ where: { id: requestId }, data: { status: 'open' } });
        }
      }

      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'not_found', message: 'assignment not found' } });
      throw err;
    }
  });

  // GET /api/v1/users/:userId/assignments — volunteer's own dashboard feed
  fastify.get('/api/v1/users/:userId/assignments', async (req, reply) => {
    const { userId } = req.params;
    const { status } = req.query || {};

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });

    const where = { volunteerId: userId };
    if (status) where.status = status;

    const assignments = await prisma.volunteerAssignment.findMany({
      where,
      include: {
        request: {
          include: { author: { select: { id: true, displayName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Scrub anonymous authors
    const sanitized = assignments.map((a) => ({
      ...a,
      request: a.request.anonymous
        ? { ...a.request, authorId: null, author: null }
        : a.request,
    }));

    return { data: sanitized };
  });
}
