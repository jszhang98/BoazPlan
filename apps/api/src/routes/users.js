import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function userRoutes(fastify) {
  // Register / create user (auto-verify for now)
  fastify.post('/api/v1/users', async (req, reply) => {
    const { email, displayName, phone } = req.body || {};
    if (!email) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'email is required' } });
    }
    try {
      const user = await prisma.user.create({
        data: { email, displayName, phone, verified: true },
      });
      return reply.status(201).send({ data: user });
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'conflict', message: 'email or phone already in use' } });
      }
      throw err;
    }
  });

  // Get user profile
  fastify.get('/api/v1/users/:id', async (req, reply) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });
    }
    return { data: user };
  });

  // Update profile
  fastify.patch('/api/v1/users/:id', async (req, reply) => {
    const { id } = req.params;
    const { displayName, notificationPreferences } = req.body || {};
    const user = await prisma.user.update({
      where: { id },
      data: { displayName, notificationPreferences },
      });
    return { data: user };
  });

  // Delete / anonymise user account (GDPR-style PII removal — NFR1/NFR5)
  // Immediately removes all identifiable data; anonymised record is retained
  // to preserve referential integrity in audit logs and requests.
  fastify.delete('/api/v1/users/:id', async (req, reply) => {
    const { id } = req.params;
    try {
      const anonEmail = `deleted-${id}@anon.boazplan`;
      await prisma.user.update({
        where: { id },
        data: {
          email: anonEmail,
          displayName: '[Deleted User]',
          phone: null,
          verified: false,
          notificationPreferences: null,
          verificationCode: null,
          verificationExpiresAt: null,
        },
      });
      // Record the deletion in the audit log
      await prisma.auditLog.create({
        data: {
          actorId: id,
          action: 'account_deleted',
          targetType: 'user',
          targetId: id,
          reason: 'User-requested account deletion — PII anonymised immediately',
        },
      });
      return reply.status(200).send({ data: { message: 'Account deleted and PII anonymised.' } });
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: { code: 'not_found', message: 'user not found' } });
      }
      throw err;
    }
  });
}
