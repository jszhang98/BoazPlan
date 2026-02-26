import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Convert a church name into a URL-safe slug, e.g. "Grace Chapel" -> "grace-chapel" */
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default async function churchRoutes(fastify) {
  // Create a new church
  fastify.post('/api/v1/churches', async (req, reply) => {
    const { name, slug, location, privacyMode } = req.body || {};
    if (!name) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'name is required' } });
    }

    const resolvedSlug = slug ? slug.toLowerCase().trim() : slugify(name);

    try {
      const church = await prisma.church.create({
        data: {
          name,
          slug: resolvedSlug,
          location: location || null,
          privacyMode: privacyMode === 'strict' ? 'strict' : 'open',
        },
      });
      return reply.status(201).send({ data: church });
    } catch (err) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: { code: 'conflict', message: 'a church with that slug already exists' } });
      }
      throw err;
    }
  });

  // Get church by ID
  fastify.get('/api/v1/churches/:id', async (req, reply) => {
    const { id } = req.params;
    const church = await prisma.church.findUnique({ where: { id } });
    if (!church) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
    }
    return { data: church };
  });

  // Get church by slug
  fastify.get('/api/v1/churches/slug/:slug', async (req, reply) => {
    const { slug } = req.params;
    const church = await prisma.church.findUnique({ where: { slug } });
    if (!church) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
    }
    return { data: church };
  });

  // Update church core settings (name, location, privacyMode)
  fastify.patch('/api/v1/churches/:id', async (req, reply) => {
    const { id } = req.params;
    const { name, location, privacyMode } = req.body || {};
    try {
      const church = await prisma.church.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(location !== undefined && { location }),
          ...(privacyMode !== undefined && { privacyMode }),
        },
      });
      return { data: church };
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
      }
      throw err;
    }
  });

  // ── Governance settings ──────────────────────────────────────────

  // GET /api/v1/churches/:id/settings  — return governance fields
  fastify.get('/api/v1/churches/:id/settings', async (req, reply) => {
    const { id } = req.params;
    const church = await prisma.church.findUnique({
      where: { id },
      select: { id: true, name: true, privacyMode: true, requireApproval: true, reportThreshold: true },
    });
    if (!church) {
      return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
    }
    return { data: church };
  });

  // PATCH /api/v1/churches/:id/settings  — update governance + write audit log
  fastify.patch('/api/v1/churches/:id/settings', async (req, reply) => {
    const { id } = req.params;
    const { privacyMode, requireApproval, reportThreshold, actorId, reason } = req.body || {};

    // Validate reportThreshold if provided
    if (reportThreshold !== undefined) {
      const n = Number(reportThreshold);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return reply.status(400).send({ error: { code: 'invalid_input', message: 'reportThreshold must be an integer 1–100' } });
      }
    }

    try {
      const church = await prisma.church.update({
        where: { id },
        data: {
          ...(privacyMode !== undefined && { privacyMode: privacyMode === 'strict' ? 'strict' : 'open' }),
          ...(requireApproval !== undefined && { requireApproval: Boolean(requireApproval) }),
          ...(reportThreshold !== undefined && { reportThreshold: Number(reportThreshold) }),
        },
        select: { id: true, name: true, privacyMode: true, requireApproval: true, reportThreshold: true },
      });

      // Write immutable audit log entry
      await prisma.auditLog.create({
        data: {
          actorId: actorId || null,
          action: 'update_church_settings',
          targetType: 'church',
          targetId: id,
          reason: reason || null,
          metadata: JSON.stringify({ privacyMode, requireApproval, reportThreshold }),
        },
      });

      return { data: church };
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ error: { code: 'not_found', message: 'church not found' } });
      }
      throw err;
    }
  });
}
