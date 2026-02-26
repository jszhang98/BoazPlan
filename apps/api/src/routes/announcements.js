import { PrismaClient } from '@prisma/client';
import { broadcastToChurch } from '../services/notifications.js';

const prisma = new PrismaClient();

export default async function announcementRoutes(fastify) {
  // POST /api/v1/churches/:id/announcements — create and broadcast to all members
  fastify.post('/api/v1/churches/:id/announcements', async (req, reply) => {
    const { id: churchId } = req.params;
    const { title, body, authorId } = req.body || {};

    if (!title || !body) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'title and body are required' } });
    }

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });

    if (authorId) {
      const author = await prisma.user.findUnique({ where: { id: authorId } });
      if (!author) return reply.status(404).send({ error: { code: 'not_found', message: 'author not found' } });
    }

    const announcement = await prisma.announcement.create({
      data: { churchId, authorId: authorId || null, title, body },
      include: { author: { select: { id: true, displayName: true } } },
    });

    // Broadcast in-app (+ push/email if configured) to all church members
    // Fire-and-forget — don't block the HTTP response
    broadcastToChurch(churchId, {
      type: 'announcement',
      title,
      body,
      metadata: { churchId, announcementId: announcement.id },
    }).catch(() => {});

    return reply.status(201).send({ data: announcement });
  });

  // GET /api/v1/churches/:id/announcements — list announcements (newest first)
  fastify.get('/api/v1/churches/:id/announcements', async (req, reply) => {
    const { id: churchId } = req.params;

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });

    const announcements = await prisma.announcement.findMany({
      where: { churchId },
      include: { author: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { data: announcements };
  });
}
