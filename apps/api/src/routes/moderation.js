import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_ACTIONS = ['hide', 'restore', 'dismiss_reports', 'approve'];

export default async function moderationRoutes(fastify) {
  // GET /api/v1/moderation/queue — requests with pending reports
  fastify.get('/api/v1/moderation/queue', async (req) => {
    const { status } = req.query || {};

    const where = {
      reports: { some: { status: 'pending' } },
    };
    if (status) where.status = status;

    const requests = await prisma.request.findMany({
      where,
      include: {
        author:  { select: { id: true, displayName: true } },
        reports: { where: { status: 'pending' }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: requests };
  });

  // GET /api/v1/moderation/hidden — all currently hidden requests
  fastify.get('/api/v1/moderation/hidden', async () => {
    const requests = await prisma.request.findMany({
      where: { hidden: true },
      include: {
        author:  { select: { id: true, displayName: true } },
        reports: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { data: requests };
  });

  // PATCH /api/v1/moderation/requests/:id — perform a moderation action
  fastify.patch('/api/v1/moderation/requests/:id', async (req, reply) => {
    const { id: requestId } = req.params;
    const { action, reason, actorId } = req.body || {};

    if (!action) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'action is required' } });
    }
    if (!VALID_ACTIONS.includes(action)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `action must be one of: ${VALID_ACTIONS.join(', ')}` } });
    }
    if (!reason) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'reason is required' } });
    }

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    // Apply the action
    let requestUpdate = {};
    let reportStatusUpdate = null;

    switch (action) {
      case 'hide':
        requestUpdate = { hidden: true };
        reportStatusUpdate = 'reviewed';
        break;
      case 'restore':
        requestUpdate = { hidden: false };
        reportStatusUpdate = 'dismissed';
        break;
      case 'dismiss_reports':
        reportStatusUpdate = 'dismissed';
        break;
      case 'approve':
        requestUpdate = { hidden: false, status: 'open' };
        reportStatusUpdate = 'dismissed';
        break;
    }

    // Update request if needed
    if (Object.keys(requestUpdate).length > 0) {
      await prisma.request.update({ where: { id: requestId }, data: requestUpdate });
    }

    // Update pending reports if needed
    if (reportStatusUpdate) {
      await prisma.contentReport.updateMany({
        where: { requestId, status: 'pending' },
        data: { status: reportStatusUpdate },
      });
    }

    // Record moderation action
    const modAction = await prisma.moderationAction.create({
      data: { requestId, actorId: actorId || null, action, reason },
      include: { actor: { select: { id: true, displayName: true } } },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId:    actorId || null,
        action:     `moderation_${action}`,
        targetType: 'request',
        targetId:   requestId,
        reason,
        metadata:   JSON.stringify({ moderationActionId: modAction.id }),
      },
    });

    const updated = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        author:  { select: { id: true, displayName: true } },
        reports: { where: { status: 'pending' } },
      },
    });

    return { data: { request: updated, action: modAction } };
  });

  // GET /api/v1/moderation/requests/:id/actions — history of mod actions for a request
  fastify.get('/api/v1/moderation/requests/:id/actions', async (req, reply) => {
    const { id: requestId } = req.params;
    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    const actions = await prisma.moderationAction.findMany({
      where: { requestId },
      include: { actor: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: actions };
  });
}
