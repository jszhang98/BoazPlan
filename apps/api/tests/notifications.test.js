import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import fastify from '../src/index.js';

const prisma = new PrismaClient();
afterAll(() => Promise.all([fastify.close(), prisma.$disconnect()]));

describe('Notifications API', () => {
  let userId, requestId, volunteerId, assignmentId;

  beforeAll(async () => {
    const ts = Date.now();

    const authorRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `notif-author-${ts}@test.com`, displayName: 'Notif Author' },
    });
    userId = JSON.parse(authorRes.body).data.id;

    const volRes = await fastify.inject({
      method: 'POST', url: '/api/v1/users',
      payload: { email: `notif-vol-${ts}@test.com`, displayName: 'Notif Volunteer' },
    });
    volunteerId = JSON.parse(volRes.body).data.id;

    const reqRes = await fastify.inject({
      method: 'POST', url: '/api/v1/requests',
      payload: { title: 'Need help with groceries', authorId: userId },
    });
    requestId = JSON.parse(reqRes.body).data.id;
  });

  it('GET /api/v1/users/:id/notifications — returns array (may be empty)', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications`,
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data).toBeInstanceOf(Array);
  });

  it('GET — 404 for unknown user', async () => {
    const res = await fastify.inject({
      method: 'GET', url: '/api/v1/users/unknown-id/notifications',
    });
    expect(res.statusCode).toBe(404);
  });

  it('POST /api/v1/users/:id/push-subscriptions — registers a push subscription', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/users/${userId}/push-subscriptions`,
      payload: {
        endpoint: `https://fcm.googleapis.com/fcm/send/test-${Date.now()}`,
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtZ',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    });
    expect(res.statusCode).toBe(201);
    const { data } = JSON.parse(res.body);
    expect(data.userId).toBe(userId);
  });

  it('POST push-subscriptions — 400 if fields missing', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/users/${userId}/push-subscriptions`,
      payload: { endpoint: 'https://example.com' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('creating an assignment fires notification for the request author', async () => {
    const res = await fastify.inject({
      method: 'POST', url: `/api/v1/requests/${requestId}/assignments`,
      payload: { volunteerId, note: 'Happy to help' },
    });
    expect(res.statusCode).toBe(201);
    assignmentId = JSON.parse(res.body).data.id;

    // Allow the async notification to settle
    await new Promise((r) => setTimeout(r, 50));

    const notifRes = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications`,
    });
    const { data } = JSON.parse(notifRes.body);
    expect(data.some((n) => n.type === 'assignment_created')).toBe(true);
  });

  it('updating assignment status fires notification for the request author', async () => {
    await fastify.inject({
      method: 'PATCH', url: `/api/v1/requests/${requestId}/assignments/${assignmentId}`,
      payload: { status: 'accepted' },
    });

    await new Promise((r) => setTimeout(r, 50));

    const notifRes = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications`,
    });
    const { data } = JSON.parse(notifRes.body);
    expect(data.some((n) => n.type === 'assignment_updated')).toBe(true);
  });

  it('PATCH /api/v1/users/:id/notifications/:nid — marks a notification as read', async () => {
    const listRes = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications`,
    });
    const nid = JSON.parse(listRes.body).data[0].id;

    const res = await fastify.inject({
      method: 'PATCH', url: `/api/v1/users/${userId}/notifications/${nid}`,
      payload: { read: true },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.read).toBe(true);
  });

  it('GET with ?all=false returns only unread notifications', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications?all=false`,
    });
    const { data } = JSON.parse(res.body);
    expect(data.every((n) => n.read === false)).toBe(true);
  });

  it('GET with ?all=true returns all notifications', async () => {
    const res = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications?all=true`,
    });
    const { data } = JSON.parse(res.body);
    expect(data.length).toBeGreaterThan(0);
  });

  it('PATCH read-all marks all unread notifications as read', async () => {
    const res = await fastify.inject({
      method: 'PATCH', url: `/api/v1/users/${userId}/notifications/read-all`,
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.updated).toBeTypeOf('number');

    // Unread count should now be 0
    const listRes = await fastify.inject({
      method: 'GET', url: `/api/v1/users/${userId}/notifications?all=false`,
    });
    expect(JSON.parse(listRes.body).data.length).toBe(0);
  });

  it('DELETE /api/v1/users/:id/push-subscriptions — removes the subscription', async () => {
    // Find the endpoint registered earlier
    const sub = await prisma.pushSubscription.findFirst({ where: { userId } });
    if (!sub) return; // already cleaned up

    const res = await fastify.inject({
      method: 'DELETE', url: `/api/v1/users/${userId}/push-subscriptions`,
      payload: { endpoint: sub.endpoint },
    });
    expect(res.statusCode).toBe(204);
  });
});
