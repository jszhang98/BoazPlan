import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Memberships API', () => {
  let churchId, userId;

  beforeAll(async () => {
    // Create a church and user to work with
    const churchRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: 'RBAC Test Church', slug: `rbac-church-${Date.now()}` },
    });
    churchId = JSON.parse(churchRes.body).data.id;

    const userRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/users',
      payload: { email: `rbac-${Date.now()}@test.com`, displayName: 'RBAC User' },
    });
    userId = JSON.parse(userRes.body).data.id;
  });

  it('POST /api/v1/churches/:id/members — adds a member', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/churches/${churchId}/members`,
      payload: { userId, role: 'member' },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.data.role).toBe('member');
    expect(body.data.user.id).toBe(userId);
  });

  it('GET /api/v1/churches/:id/members — lists members', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/churches/${churchId}/members`,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.length).toBe(1);
    expect(body.data[0].userId).toBe(userId);
  });

  it('PATCH /api/v1/churches/:id/members/:userId — promotes to pastor', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/churches/${churchId}/members/${userId}`,
      payload: { role: 'pastor' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.role).toBe('pastor');
  });

  it('POST — rejects duplicate membership', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/churches/${churchId}/members`,
      payload: { userId, role: 'member' },
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST — rejects invalid role', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/churches/${churchId}/members`,
      payload: { userId: 'some-id', role: 'superadmin' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('DELETE /api/v1/churches/:id/members/:userId — removes member', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/churches/${churchId}/members/${userId}`,
    });
    expect(res.statusCode).toBe(204);

    // Verify removed
    const listRes = await fastify.inject({
      method: 'GET',
      url: `/api/v1/churches/${churchId}/members`,
    });
    expect(JSON.parse(listRes.body).data.length).toBe(0);
  });
});
