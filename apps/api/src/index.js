import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import healthRoutes from './routes/health.js';
import requestRoutes from './routes/requests.js';
import userRoutes from './routes/users.js';
import churchRoutes from './routes/churches.js';
import membershipRoutes from './routes/memberships.js';
import assignmentRoutes from './routes/assignments.js';
import reportRoutes from './routes/reports.js';
import moderationRoutes from './routes/moderation.js';
import auditLogRoutes from './routes/audit-logs.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import announcementRoutes from './routes/announcements.js';

const fastify = Fastify({ logger: true });
await fastify.register(cors, { origin: true });
await fastify.register(helmet, {
  contentSecurityPolicy: false, // Vite dev handles CSP; set in production via reverse proxy
});
await fastify.register(rateLimit, {
  global: true,
  max: 200,          // NFR17: max 200 req/min per IP
  timeWindow: '1 minute',
  keyGenerator: (req) => req.ip,
  errorResponseBuilder: (_req, context) => ({
    error: { code: 'rate_limited', message: `Rate limit exceeded. Retry after ${context.after}.` },
  }),
});

await fastify.register(healthRoutes);
await fastify.register(requestRoutes);
await fastify.register(userRoutes);
await fastify.register(churchRoutes);
await fastify.register(membershipRoutes);
await fastify.register(assignmentRoutes);
await fastify.register(reportRoutes);
await fastify.register(moderationRoutes);
await fastify.register(auditLogRoutes);
await fastify.register(adminRoutes);
await fastify.register(notificationRoutes);
await fastify.register(announcementRoutes);

// Start server when run directly (ESM-compatible check)
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain) {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });

    // Weekly digest cron — only when ENABLE_DIGEST_CRON=true is set
    if (process.env.ENABLE_DIGEST_CRON === 'true') {
      const { default: cron } = await import('node-cron');
      const { runWeeklyDigest } = await import('./services/notifications.js');
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      // Every Sunday at 08:00 local time
      cron.schedule('0 8 * * 0', async () => {
        const churches = await prisma.church.findMany({ select: { id: true } });
        await Promise.allSettled(churches.map((c) => runWeeklyDigest(c.id)));
        fastify.log.info(`[digest] Processed ${churches.length} churches`);
      });
      fastify.log.info('[digest] Weekly digest cron scheduled (Sundays 08:00)');
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

export default fastify; // for testing

