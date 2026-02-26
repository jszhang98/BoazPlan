import { PrismaClient } from '@prisma/client';
import { runWeeklyDigest } from '../services/notifications.js';

const prisma = new PrismaClient();

export default async function notificationRoutes(fastify) {
  // ── In-app notification inbox ─────────────────────────────────────────────

  // GET /api/v1/users/:id/notifications
  // ?all=true  → return all (read + unread)
  // ?all=false or absent → return unread only (default)
  fastify.get('/api/v1/users/:id/notifications', async (req, reply) => {
    const { id: userId } = req.params;
    const showAll = req.query.all === 'true';

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });

    const where = { userId };
    if (!showAll) where.read = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { data: notifications };
  });

  // PATCH /api/v1/users/:id/notifications/:nid — mark as read (or unread)
  fastify.patch('/api/v1/users/:id/notifications/:nid', async (req, reply) => {
    const { nid } = req.params;
    const { read } = req.body || {};

    if (typeof read !== 'boolean') {
      return reply.status(400).send({ error: { code: 'invalid_input', message: '`read` (boolean) is required' } });
    }

    try {
      const notification = await prisma.notification.update({
        where: { id: nid },
        data: { read },
      });
      return { data: notification };
    } catch (err) {
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'not_found', message: 'notification not found' } });
      throw err;
    }
  });

  // PATCH /api/v1/users/:id/notifications/read-all — mark all unread as read
  fastify.patch('/api/v1/users/:id/notifications/read-all', async (req, reply) => {
    const { id: userId } = req.params;

    const { count } = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { data: { updated: count } };
  });

  // ── Push subscription management ──────────────────────────────────────────

  // POST /api/v1/users/:id/push-subscriptions — register a Web Push subscription
  fastify.post('/api/v1/users/:id/push-subscriptions', async (req, reply) => {
    const { id: userId } = req.params;
    const { endpoint, p256dh, auth } = req.body || {};

    if (!endpoint || !p256dh || !auth) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'endpoint, p256dh, and auth are required' } });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });

    try {
      const sub = await prisma.pushSubscription.create({
        data: { userId, endpoint, p256dh, auth },
      });
      return reply.status(201).send({ data: sub });
    } catch (err) {
      if (err.code === 'P2002') {
        // Already registered — upsert silently
        const sub = await prisma.pushSubscription.update({
          where: { endpoint },
          data: { p256dh, auth },
        });
        return reply.status(200).send({ data: sub });
      }
      throw err;
    }
  });

  // DELETE /api/v1/users/:id/push-subscriptions — unregister by endpoint
  fastify.delete('/api/v1/users/:id/push-subscriptions', async (req, reply) => {
    const { endpoint } = req.body || {};

    if (!endpoint) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'endpoint is required' } });
    }

    try {
      await prisma.pushSubscription.delete({ where: { endpoint } });
      return reply.status(204).send();
    } catch (err) {
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'not_found', message: 'subscription not found' } });
      throw err;
    }
  });

  // ── On-demand digest ──────────────────────────────────────────────────────

  // POST /api/v1/churches/:id/digest — trigger weekly digest immediately
  // (also used by the scheduled cron; exposed here for admin/testing)
  fastify.post('/api/v1/churches/:id/digest', async (req, reply) => {
    const { id: churchId } = req.params;

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });

    const result = await runWeeklyDigest(churchId);
    return { data: result };
  });
}
