import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_REASONS = ['spam', 'harassment', 'inappropriate', 'off-topic', 'other'];
const DEFAULT_THRESHOLD = 3;

export default async function reportRoutes(fastify) {
  // POST /api/v1/requests/:id/reports — submit a content report
  fastify.post('/api/v1/requests/:id/reports', async (req, reply) => {
    const { id: requestId } = req.params;
    const { reporterId, reason, notes } = req.body || {};

    if (!reason) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'reason is required' } });
    }
    if (!VALID_REASONS.includes(reason)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `reason must be one of: ${VALID_REASONS.join(', ')}` } });
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { church: { select: { reportThreshold: true } } },
    });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    const threshold = request.church?.reportThreshold ?? DEFAULT_THRESHOLD;

    const report = await prisma.contentReport.create({
      data: { requestId, reporterId: reporterId || null, reason, notes: notes || null },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId:    reporterId || null,
        action:     'report_created',
        targetType: 'request',
        targetId:   requestId,
        reason,
        metadata:   JSON.stringify({ reportId: report.id }),
      },
    });

    // Auto-hide if threshold reached
    const pendingCount = await prisma.contentReport.count({
      where: { requestId, status: 'pending' },
    });

    if (pendingCount >= threshold && !request.hidden) {
      await prisma.request.update({ where: { id: requestId }, data: { hidden: true } });
      await prisma.auditLog.create({
        data: {
          actorId:    null,
          action:     'content_auto_hidden',
          targetType: 'request',
          targetId:   requestId,
          reason:     `Auto-hidden after ${pendingCount} reports`,
          metadata:   JSON.stringify({ threshold }),
        },
      });
    }

    return reply.status(201).send({ data: report });
  });

  // GET /api/v1/requests/:id/reports — list reports for a request
  fastify.get('/api/v1/requests/:id/reports', async (req, reply) => {
    const { id: requestId } = req.params;
    const { status } = req.query || {};

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });

    const where = { requestId };
    if (status) where.status = status;

    const reports = await prisma.contentReport.findMany({
      where,
      include: { reporter: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { data: reports };
  });
}
