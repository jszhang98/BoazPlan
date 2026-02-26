import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let userId;

beforeAll(async () => {
  await app.ready();
  const user = await prisma.user.create({
    data: { email: `security-test-${Date.now()}@test.com`, displayName: 'SecTest' },
  });
  userId = user.id;
});

// ─────────────────────────────────────────────
// Story 7.3 — Security headers
// ─────────────────────────────────────────────
describe('Security headers (7.3)', () => {
  it('GET /api/v1/health returns x-frame-options or x-content-type-options header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    // Helmet adds at least one of these standard headers
    const hasSecurityHeader =
      res.headers['x-frame-options'] !== undefined ||
      res.headers['x-content-type-options'] !== undefined ||
      res.headers['x-dns-prefetch-control'] !== undefined;
    expect(hasSecurityHeader).toBe(true);
  });

  it('responses include x-content-type-options: nosniff', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

// ─────────────────────────────────────────────
// Story 7.3 — Account deletion / PII removal
// ─────────────────────────────────────────────
describe('DELETE /api/v1/users/:id — PII anonymisation (7.3)', () => {
  it('returns 200 and success message', async () => {
    const res = await app.inject({ method: 'DELETE', url: `/api/v1/users/${userId}` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.message).toMatch(/anonymised/i);
  });

  it('anonymises email and displayName in the database', async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user.email).toMatch(/^deleted-/);
    expect(user.displayName).toBe('[Deleted User]');
    expect(user.phone).toBeNull();
    expect(user.verified).toBe(false);
  });

  it('writes an account_deleted audit log entry', async () => {
    const log = await prisma.auditLog.findFirst({
      where: { targetType: 'user', targetId: userId, action: 'account_deleted' },
    });
    expect(log).not.toBeNull();
    expect(log.actorId).toBe(userId);
  });

  it('GET on the anonymised user still returns 200 (record retained for referential integrity)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/users/${userId}` });
    expect(res.statusCode).toBe(200);
    const { data } = JSON.parse(res.body);
    expect(data.displayName).toBe('[Deleted User]');
  });

  it('returns 404 for non-existent user', async () => {
    const res = await app.inject({ method: 'DELETE', url: '/api/v1/users/nonexistent-id' });
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────
// Story 7.3 — Rate limit headers present
// ─────────────────────────────────────────────
describe('Rate limit headers (7.3)', () => {
  it('responses include x-ratelimit-limit header', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' });
    // @fastify/rate-limit adds these headers
    expect(res.headers['x-ratelimit-limit']).toBeDefined();
    expect(res.headers['x-ratelimit-remaining']).toBeDefined();
  });
});
