import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_ROLES = ['member', 'leader', 'pastor', 'admin'];

export default async function membershipRoutes(fastify) {
  // Add a user to a church with a role
  fastify.post('/api/v1/churches/:id/members', async (req, reply) => {
    const { id: churchId } = req.params;
    const { userId, role = 'member' } = req.body || {};

    if (!userId) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'userId is required' } });
    }
    if (!VALID_ROLES.includes(role)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `role must be one of: ${VALID_ROLES.join(', ')}` } });
    }

    // Verify church and user exist
    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });
    }

    try {
      const membership = await prisma.churchMembership.create({
        data: { churchId, userId, role },
        include: { user: { select: { id: true, email: true, displayName: true } } },
      });
      return reply.status(201).send({ data: membership });
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'conflict', message: 'user is already a member of this church' } });
      }
      throw err;
    }
  });

  // List members of a church
  fastify.get('/api/v1/churches/:id/members', async (req, reply) => {
    const { id: churchId } = req.params;
    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
    }
    const members = await prisma.churchMembership.findMany({
      where: { churchId },
      include: { user: { select: { id: true, email: true, displayName: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { data: members };
  });

  // Update a member's role
  fastify.patch('/api/v1/churches/:id/members/:userId', async (req, reply) => {
    const { id: churchId, userId } = req.params;
    const { role } = req.body || {};

    if (!role || !VALID_ROLES.includes(role)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `role must be one of: ${VALID_ROLES.join(', ')}` } });
    }

    try {
      const membership = await prisma.churchMembership.update({
        where: { churchId_userId: { churchId, userId } },
        data: { role },
        include: { user: { select: { id: true, email: true, displayName: true } } },
      });
      return { data: membership };
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: { code: 'not_found', message: 'membership not found' } });
      }
      throw err;
    }
  });

  // Remove a member from a church
  fastify.delete('/api/v1/churches/:id/members/:userId', async (req, reply) => {
    const { id: churchId, userId } = req.params;
    try {
      await prisma.churchMembership.delete({
        where: { churchId_userId: { churchId, userId } },
      });
      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: { code: 'not_found', message: 'membership not found' } });
      }
      throw err;
    }
  });
}
