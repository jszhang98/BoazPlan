import { describe, it, expect, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Requests API', () => {
  let requestId;

  it('POST /api/v1/requests — creates with defaults', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Need help moving this weekend' },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.title).toBe('Need help moving this weekend');
    expect(data.urgency).toBe('normal');
    expect(data.visibility).toBe('public');
    expect(data.status).toBe('open');
    requestId = data.id;
  });

  it('POST /api/v1/requests — creates with urgency=urgent and visibility=private', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Emergency: no food at home', urgency: 'urgent', visibility: 'private' },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.urgency).toBe('urgent');
    expect(data.visibility).toBe('private');
  });

  it('POST /api/v1/requests — rejects missing title', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe('invalid_input');
  });

  it('POST /api/v1/requests — rejects invalid urgency', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Test', urgency: 'critical' },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.message).toMatch(/urgency/);
  });

  it('POST /api/v1/requests — rejects invalid visibility', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Test', visibility: 'friends' },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error.message).toMatch(/visibility/);
  });

  it('GET /api/v1/requests/:id — returns created request', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.id).toBe(requestId);
  });

  it('GET /api/v1/requests — lists all requests', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/requests' });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/requests/:id — updates status to assigned', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${requestId}`,
      payload: { status: 'assigned' },
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.status).toBe('assigned');
  });

  it('PATCH /api/v1/requests/:id — rejects invalid status', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${requestId}`,
      payload: { status: 'deleted' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/v1/requests/:id — 404 for unknown id', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/requests/nonexistent-id' });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/requests — anonymous=true scrubs author from response', async () => {
    // Create a user to attach as author
    const userRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/users',
      payload: { email: `anon-test-${Date.now()}@test.com`, displayName: 'Secret Person' },
    });
    const userId = JSON.parse(userRes.body).data.id;

    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Anonymous need', anonymous: true, authorId: userId },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.anonymous).toBe(true);
    expect(data.author).toBeNull();
    expect(data.authorId).toBeNull();
  });

  it('GET /api/v1/requests/:id — anonymous request hides author', async () => {
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Hidden author request', anonymous: true },
    });
    const id = JSON.parse(createRes.body).data.id;

    const res = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${id}` });
    const { data } = JSON.parse(res.body);
    expect(data.anonymous).toBe(true);
    expect(data.author).toBeNull();
  });

  it('POST /api/v1/requests — strict church auto-sets pending_approval', async () => {
    // Create a strict church
    const churchRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: `Strict Church ${Date.now()}`, privacyMode: 'strict' },
    });
    const churchId = JSON.parse(churchRes.body).data.id;

    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Needs approval', churchId },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.status).toBe('pending_approval');
    expect(data.churchId).toBe(churchId);
  });

  it('POST /api/v1/requests — open church keeps status=open', async () => {
    const churchRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: `Open Church ${Date.now()}`, privacyMode: 'open' },
    });
    const churchId = JSON.parse(churchRes.body).data.id;

    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'No approval needed', churchId },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.status).toBe('open');
  });

  it('PATCH /api/v1/requests/:id — can toggle anonymous off', async () => {
    const createRes = await fastify.inject({
      method: 'POST',
      url: '/api/v1/requests',
      payload: { title: 'Toggle anon', anonymous: true },
    });
    const id = JSON.parse(createRes.body).data.id;

    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${id}`,
      payload: { anonymous: false },
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.anonymous).toBe(false);
  });
});
