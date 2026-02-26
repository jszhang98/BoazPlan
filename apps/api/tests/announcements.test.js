import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Announcements & Digests', () => {
  let churchId, pastorId, memberId;

  beforeAll(async () => {
    const ts = Date.now();

    const churchRes = await fastify.inject({
      method: 'POST', url: '/api/v1/churches',
      payload: { name: `Announce Church ${ts}`, slug: `ann-${ts}` },
    });
    churchId = JSON.parse(churchRes.body).data.id;

    const pastorRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `pastor-${ts}@test.com`, displayName: 'Pastor Mike' },
    });
    pastorId = JSON.parse(pastorRes.body).data.id;

    const memberRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `member-${ts}@test.com`, displayName: 'Member Jane' },
    });
    memberId = JSON.parse(memberRes.body).data.id;

    // Add both to the church
    await fastify.inject({
      method: 'POST', url: `/api/v1/churches/${churchId}/members`,
      payload: { userId: pastorId, role: 'pastor' },
    });
    await fastify.inject({
      method: 'POST', url: `/api/v1/churches/${churchId}/members`,
      payload: { userId: memberId, role: 'member' },
    });
  });

  it('POST /api/v1/churches/:id/announcements — 400 if title or body missing', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/churches/${churchId}/announcements`,
      payload: { title: 'No body here' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/v1/churches/:id/announcements — creates the announcement', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/churches/${churchId}/announcements`,
      payload: { title: 'Church Picnic This Sunday', body: 'Join us at the park at noon!', authorId: pastorId },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.title).toBe('Church Picnic This Sunday');
    expect(data.churchId).toBe(churchId);
  });

  it('announcement broadcasts notification to members', async () => {
    // Allow the async broadcast to settle
    await new Promise((r) => setTimeout(r, 100));

    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${memberId}/notifications`,
    });
    const { data } = JSON.parse(res.body);
    expect(data.some((n) => n.type === 'announcement' && n.title === 'Church Picnic This Sunday')).toBe(true);
  });

  it('pastor also receives the announcement notification', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${pastorId}/notifications`,
    });
    const { data } = JSON.parse(res.body);
    expect(data.some((n) => n.type === 'announcement')).toBe(true);
  });

  it('GET /api/v1/churches/:id/announcements — lists announcements', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/churches/${churchId}/announcements`,
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].title).toBe('Church Picnic This Sunday');
  });

  it('GET announcements — 404 for unknown church', async () => {
    const res = await fastify.inject({
      method: 'GET', url: '/api/v1/churches/no-such-church/announcements',
    });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/churches/:id/digest — triggers weekly digest', async () => {
    // Ensure there's an open request for this church
    await fastify.inject({
      method: 'POST', url: '/api/v1/requests',
      payload: { title: 'Prayer for healing', churchId, authorId: pastorId },
    });

    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/churches/${churchId}/digest`,
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.sent).toBeGreaterThan(0);
  });

  it('digest sends notification to church members', async () => {
    await new Promise((r) => setTimeout(r, 100));

    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${memberId}/notifications?all=true`,
    });
    const { data } = JSON.parse(res.body);
    expect(data.some((n) => n.type === 'digest')).toBe(true);
  });

  it('POST digest — 404 for unknown church', async () => {
    const res = await fastify.inject({
      method: 'POST', url: '/api/v1/churches/no-such-church/digest',
    });
    expect(res.statusCode).toBe(404);
  });
});
