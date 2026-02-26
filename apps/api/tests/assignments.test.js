import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Volunteer Assignments API', () => {
  let requestId, volunteerId, assignmentId;

  beforeAll(async () => {
    // Create a request
    const rRes = await fastify.inject({
      method: 'POST', url: '/api/v1/requests',
      payload: { title: 'Need help with moving boxes' },
    });
    requestId = JSON.parse(rRes.body).data.id;

    // Create a volunteer user
    const uRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `vol-${Date.now()}@test.com`, displayName: 'Volunteer Joe' },
    });
    volunteerId = JSON.parse(uRes.body).data.id;
  });

  it('POST /api/v1/requests/:id/assignments — assigns a volunteer', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/requests/${requestId}/assignments`,
      payload: { volunteerId, note: 'I can help Saturday morning' },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.volunteerId).toBe(volunteerId);
    expect(data.status).toBe('pending');
    expect(data.note).toBe('I can help Saturday morning');
    assignmentId = data.id;
  });

  it('POST auto-transitions request to assigned', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}` });
    const { data } = JSON.parse(res.body);
    expect(data.status).toBe('assigned');
  });

  it('GET /api/v1/requests/:id/assignments — lists assignments', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}/assignments` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data).toHaveLength(1);
    expect(data[0].volunteer.displayName).toBe('Volunteer Joe');
  });

  it('POST — 409 on duplicate assignment', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/requests/${requestId}/assignments`,
      payload: { volunteerId },
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST — 400 missing volunteerId', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/requests/${requestId}/assignments`,
      payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('PATCH — volunteer accepts assignment', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${requestId}/assignments/${assignmentId}`,
      payload: { status: 'accepted' },
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.status).toBe('accepted');
  });

  it('PATCH — volunteer completes; request becomes resolved', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${requestId}/assignments/${assignmentId}`,
      payload: { status: 'completed', note: 'All done!' },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.status).toBe('completed');

    const rRes = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}` });
    expect(JSON.parse(rRes.body).data.status).toBe('resolved');
  });

  it('GET /api/v1/users/:userId/assignments — volunteer dashboard', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/users/${volunteerId}/assignments` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].request.title).toBe('Need help with moving boxes');
  });

  it('GET /api/v1/users/:userId/assignments?status=completed — filters by status', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/users/${volunteerId}/assignments?status=completed`,
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.every((a) => a.status === 'completed')).toBe(true);
  });

  it('PATCH — 400 on invalid status', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/requests/${requestId}/assignments/${assignmentId}`,
      payload: { status: 'ghosted' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('DELETE — removes assignment', async () => {
    // Create a fresh request + assignment to delete
    const r2 = await fastify.inject({
      method: 'POST', url: '/api/v1/requests',
      payload: { title: 'Temp for delete test' },
    });
    const r2Id = JSON.parse(r2.body).data.id;
    const a2 = await fastify.inject({
      method: 'POST',
      url: `/api/v1/requests/${r2Id}/assignments`,
      payload: { volunteerId },
    });
    const a2Id = JSON.parse(a2.body).data.id;

    const del = await fastify.inject({
      method: 'DELETE',
      url: `/api/v1/requests/${r2Id}/assignments/${a2Id}`,
    });
    expect(del.statusCode).toBe(204);

    // Request should revert to open
    const rCheck = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${r2Id}` });
    expect(JSON.parse(rCheck.body).data.status).toBe('open');
  });
});
