import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seed helpers
let churchId;
let userId;
let requestId;

beforeAll(async () => {
  await app.ready();

  // Minimal seed
  const user = await prisma.user.create({
    data: { email: `admin-test-${Date.now()}@test.com`, displayName: 'AdminT' },
  });
  userId = user.id;

  const church = await prisma.church.create({
    data: { name: `Admin Church ${Date.now()}`, slug: `admin-church-${Date.now()}` },
  });
  churchId = church.id;

  const req = await prisma.request.create({
    data: {
      title: 'Admin test request',
      description: 'desc',
      authorId: userId,
      churchId,
      status: 'open',
      urgency: 'normal',
      visibility: 'public',
    },
  });
  requestId = req.id;

  // Seed a resolved request so resolution rate > 0
  await prisma.request.create({
    data: {
      title: 'Resolved request',
      description: 'desc',
      authorId: userId,
      churchId,
      status: 'resolved',
      urgency: 'high',
      visibility: 'public',
    },
  });
});

// ──────────────────────────────────────────────────────────
// Story 6.1 — Admin Stats
// ──────────────────────────────────────────────────────────
describe('GET /api/v1/admin/stats', () => {
  it('returns the stats shape', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/stats' });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data).toHaveProperty('users.total');
    expect(data).toHaveProperty('churches.total');
    expect(data).toHaveProperty('memberships.total');
    expect(data).toHaveProperty('requests.total');
    expect(data).toHaveProperty('requests.byStatus');
    expect(data).toHaveProperty('requests.byUrgency');
    expect(data).toHaveProperty('requests.requestResolutionRate');
    expect(data).toHaveProperty('assignments.total');
    expect(data).toHaveProperty('assignments.volunteerCompletionRate');
    expect(data).toHaveProperty('moderation.pendingReports');
  });

  it('counts resolved requests and computes a resolution rate > 0', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/stats' });
    const { data } = JSON.parse(res.body);
    expect(data.requests.byStatus.resolved).toBeGreaterThan(0);
    expect(data.requests.requestResolutionRate).toBeGreaterThan(0);
  });

  it('resolution rate is in range 0–100', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/stats' });
    const { data } = JSON.parse(res.body);
    expect(data.requests.requestResolutionRate).toBeGreaterThanOrEqual(0);
    expect(data.requests.requestResolutionRate).toBeLessThanOrEqual(100);
  });
});

// ──────────────────────────────────────────────────────────
// Story 6.2 — CSV Export
// ──────────────────────────────────────────────────────────
describe('GET /api/v1/admin/export/requests.csv', () => {
  it('returns CSV content-type', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/export/requests.csv' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
  });

  it('CSV has a header row with expected columns', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/export/requests.csv' });
    const lines = res.body.trim().split('\n');
    const header = lines[0];
    expect(header).toContain('id');
    expect(header).toContain('title');
    expect(header).toContain('status');
    expect(header).toContain('urgency');
    expect(header).toContain('authorName');
  });

  it('CSV contains at least one data row', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/export/requests.csv' });
    const lines = res.body.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});

describe('GET /api/v1/admin/export/assignments.csv', () => {
  it('returns CSV with header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/admin/export/assignments.csv' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    const header = res.body.trim().split('\n')[0];
    expect(header).toContain('id');
    expect(header).toContain('requestId');
    expect(header).toContain('volunteerName');
  });
});

// ──────────────────────────────────────────────────────────
// Story 6.3 — Governance Configuration
// ──────────────────────────────────────────────────────────
describe('Church governance settings', () => {
  it('GET /api/v1/churches/:id/settings returns governance fields', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/churches/${churchId}/settings` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data).toHaveProperty('privacyMode');
    expect(data).toHaveProperty('requireApproval');
    expect(data).toHaveProperty('reportThreshold');
    expect(data.reportThreshold).toBe(3); // default
  });

  it('PATCH /api/v1/churches/:id/settings updates requireApproval and reportThreshold', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/churches/${churchId}/settings`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requireApproval: true, reportThreshold: 5, actorId: userId, reason: 'tightening policy' }),
    });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.requireApproval).toBe(true);
    expect(data.reportThreshold).toBe(5);
  });

  it('PATCH /api/v1/churches/:id/settings writes an audit log entry', async () => {
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/churches/${churchId}/settings`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ privacyMode: 'strict', actorId: userId, reason: 'audit test' }),
    });
    const log = await prisma.auditLog.findFirst({
      where: { targetType: 'church', targetId: churchId, action: 'update_church_settings' },
      orderBy: { createdAt: 'desc' },
    });
    expect(log).not.toBeNull();
    expect(log.actorId).toBe(userId);
  });

  it('PATCH returns 400 for out-of-range reportThreshold', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/churches/${churchId}/settings`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reportThreshold: 200 }),
    });
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/v1/churches/:id/settings returns 404 for unknown church', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/v1/churches/nonexistent-id/settings',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ requireApproval: false }),
    });
    expect(res.statusCode).toBe(404);
  });
});

// ──────────────────────────────────────────────────────────
// Story 6.3 — Governance: per-church reportThreshold honoured
// ──────────────────────────────────────────────────────────
describe('Per-church report threshold', () => {
  it('uses church reportThreshold (set to 5) so 3 reports do NOT auto-hide', async () => {
    // reportThreshold was set to 5 in the patch test above
    // Submit 3 reports — should not trigger auto-hide
    for (let i = 0; i < 3; i++) {
      await app.inject({
        method: 'POST',
        url: `/api/v1/requests/${requestId}/reports`,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'spam' }),
      });
    }
    const req = await prisma.request.findUnique({ where: { id: requestId } });
    expect(req.hidden).toBe(false); // threshold is 5, only 3 reports submitted
  });
});
