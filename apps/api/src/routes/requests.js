import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_URGENCY    = ['normal', 'high', 'urgent'];
const VALID_VISIBILITY = ['public', 'group', 'private'];
const VALID_STATUS     = ['open', 'pending_approval', 'assigned', 'resolved'];

// Strip author identity from a request object when anonymous=true
function scrubAuthor(req) {
  if (!req.anonymous) return req;
  return { ...req, authorId: null, author: null };
}

export default async function requestRoutes(fastify) {
  fastify.get('/api/v1/requests', async (req) => {
    const { churchId, status, visibility, urgency, includeHidden } = req.query || {};
    const where = {};
    // Exclude hidden posts from public feed unless caller explicitly requests them
    if (includeHidden !== 'true') where.hidden = false;
    if (churchId)   where.churchId   = churchId;
    if (status)     where.status     = status;
    if (visibility) where.visibility = visibility;
    if (urgency)    where.urgency    = urgency;

    const list = await prisma.request.findMany({
      where,
      include: { author: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: list.map(scrubAuthor) };
  });

  // NFR17: per-user post rate — max 5 requests per hour.
  // Enforced in production via authenticated user ID in the auth middleware.
  // The global @fastify/rate-limit (200/min per IP) also applies here.
  fastify.post('/api/v1/requests', async (req, reply) => {
    const {
      title,
      description,
      urgency    = 'normal',
      visibility = 'public',
      anonymous  = false,
      churchId,
      authorId,
    } = req.body || {};

    if (!title) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: 'title is required' } });
    }
    if (!VALID_URGENCY.includes(urgency)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `urgency must be one of: ${VALID_URGENCY.join(', ')}` } });
    }
    if (!VALID_VISIBILITY.includes(visibility)) {
      return reply.status(400).send({ error: { code: 'invalid_input', message: `visibility must be one of: ${VALID_VISIBILITY.join(', ')}` } });
    }

    // Auto-set pending_approval when church has strict privacy mode
    let status = 'open';
    if (churchId) {
      const church = await prisma.church.findUnique({ where: { id: churchId }, select: { privacyMode: true } });
      if (church?.privacyMode === 'strict') status = 'pending_approval';
    }

    const item = await prisma.request.create({
      data: {
        title,
        description: description || '',
        urgency,
        visibility,
        anonymous:  Boolean(anonymous),
        status,
        churchId:  churchId || null,
        authorId:  authorId || null,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });

    return reply.status(201).send({ data: scrubAuthor(item) });
  });

  fastify.get('/api/v1/requests/:id', async (req, reply) => {
    const { id } = req.params;
    const item = await prisma.request.findUnique({
      where: { id },
      include: { author: { select: { id: true, displayName: true } } },
    });
    if (!item) return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });
    return { data: scrubAuthor(item) };
  });

  fastify.patch('/api/v1/requests/:id', async (req, reply) => {
    const { id } = req.params;
    const { title, description, urgency, visibility, status, anonymous } = req.body || {};

    if (urgency    && !VALID_URGENCY.includes(urgency))       return reply.status(400).send({ error: { code: 'invalid_input', message: 'invalid urgency' } });
    if (visibility && !VALID_VISIBILITY.includes(visibility)) return reply.status(400).send({ error: { code: 'invalid_input', message: 'invalid visibility' } });
    if (status     && !VALID_STATUS.includes(status))         return reply.status(400).send({ error: { code: 'invalid_input', message: 'invalid status' } });

    try {
      const item = await prisma.request.update({
        where: { id },
        data: {
          ...(title       !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(urgency     !== undefined && { urgency }),
          ...(visibility  !== undefined && { visibility }),
          ...(status      !== undefined && { status }),
          ...(anonymous   !== undefined && { anonymous: Boolean(anonymous) }),
        },
        include: { author: { select: { id: true, displayName: true } } },
      });
      return { data: scrubAuthor(item) };
    } catch (err) {
      if (err.code === 'P2025') return reply.status(404).send({ error: { code: 'not_found', message: 'request not found' } });
      throw err;
    }
  });
}

