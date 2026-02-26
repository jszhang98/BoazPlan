import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function auditLogRoutes(fastify) {
  // GET /api/v1/audit-logs
  fastify.get('/api/v1/audit-logs', async (req) => {
    const { targetId, targetType, actorId, action, limit = '50', offset = '0' } = req.query || {};

    const where = {};
    if (targetId)   where.targetId   = targetId;
    if (targetType) where.targetType = targetType;
    if (actorId)    where.actorId    = actorId;
    if (action)     where.action     = action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
        take:   Math.min(parseInt(limit, 10) || 50, 200),
        skip:   parseInt(offset, 10) || 0,
      }),
    ]);

    return { data: logs, meta: { total, limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 } };
  });
}
