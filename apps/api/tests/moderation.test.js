import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Moderation & Safety API', () => {
  let requestId, reportId, reporterId;

  beforeAll(async () => {
    // Create a user (reporter)
    const uRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `reporter-${Date.now()}@test.com`, displayName: 'Reporter' },
    });
    reporterId = JSON.parse(uRes.body).data.id;

    // Create a request to report
    const rRes = await fastify.inject({
      method: 'POST', url: '/api/v1/requests',
      payload: { title: 'Controversial post for reporting' },
    });
    requestId = JSON.parse(rRes.body).data.id;
  });

  // ─── Reports ──────────────────────────────────────────────────────────────

  it('POST /api/v1/requests/:id/reports — creates a report', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: `/api/v1/requests/${requestId}/reports`,
      payload: { reporterId, reason: 'spam', notes: 'This looks like spam' },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.reason).toBe('spam');
    expect(data.status).toBe('pending');
    reportId = data.id;
  });

  it('POST — 400 on missing reason', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/requests/${requestId}/reports`, payload: {},
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST — 400 on invalid reason', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/requests/${requestId}/reports`,
      payload: { reason: 'totally-made-up' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/v1/requests/:id/reports — lists reports', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}/reports` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].reason).toBe('spam');
  });

  it('auto-hides request after 3 pending reports', async () => {
    // Submit 2 more reports (first was already submitted)
    for (let i = 0; i < 2; i++) {
      await fastify.inject({
        method: 'POST', url: `/api/v1/requests/${requestId}/reports`,
        payload: { reason: 'harassment' },
      });
    }
    const rRes = await fastify.inject({ method: 'GET', url: `/api/v1/requests/${requestId}` });
    expect(JSON.parse(rRes.body).data.hidden).toBe(true);
  });

  it('hidden request is excluded from the public feed', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/requests' });
    const { data } = JSON.parse(res.body);
    const found = data.find((r) => r.id === requestId);
    expect(found).toBeUndefined();
  });

  // ─── Moderation Queue ─────────────────────────────────────────────────────

  it('GET /api/v1/moderation/queue — returns flagged requests', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/moderation/queue' });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    const found = data.find((r) => r.id === requestId);
    expect(found).toBeDefined();
    expect(found.reports.length).toBeGreaterThan(0);
  });

  // ─── Moderation Actions ───────────────────────────────────────────────────

  it('PATCH /api/v1/moderation/requests/:id — 400 on missing action', async () => {
    const res = await fastify.inject({
      method: 'PATCH', url: `/api/v1/moderation/requests/${requestId}`,
      payload: { reason: 'looks fine' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('PATCH — restore action un-hides the request', async () => {
    const res = await fastify.inject({
      method: 'PATCH', url: `/api/v1/moderation/requests/${requestId}`,
      payload: { action: 'restore', reason: 'Content is acceptable', actorId: reporterId },
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.request.hidden).toBe(false);
    expect(data.action.action).toBe('restore');
  });

  it('PATCH — hide action hides the request', async () => {
    const res = await fastify.inject({
      method: 'PATCH', url: `/api/v1/moderation/requests/${requestId}`,
      payload: { action: 'hide', reason: 'Violates community guidelines', actorId: reporterId },
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.request.hidden).toBe(true);
  });

  it('GET /api/v1/moderation/requests/:id/actions — lists moderation history', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/moderation/requests/${requestId}/actions`,
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThanOrEqual(2); // restore + hide
  });

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  it('GET /api/v1/audit-logs — returns logs', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/v1/audit-logs' });
    expect(res.statusCode).toBe(200);
    const { data, meta } = JSON.parse(res.body);
    expect(Array.isArray(data)).toBe(true);
    expect(meta.total).toBeGreaterThan(0);
  });

  it('GET /api/v1/audit-logs?targetId=... — filters by targetId', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/audit-logs?targetId=${requestId}`,
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((l) => l.targetId === requestId)).toBe(true);
  });

  it('GET /api/v1/audit-logs?action=report_created — filters by action', async () => {
    const res = await fastify.inject({
      method: 'GET', url: '/api/v1/audit-logs?action=report_created',
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((l) => l.action === 'report_created')).toBe(true);
  });
});
