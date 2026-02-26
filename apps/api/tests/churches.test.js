import { describe, it, expect, afterAll } from 'vitest';
import fastify from '../src/index.js';

afterAll(() => fastify.close());

describe('Churches API', () => {
  const slug = `test-church-${Date.now()}`;
  let churchId;

  it('POST /api/v1/churches — creates a church', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: 'Test Church', slug, location: 'Test City', privacyMode: 'open' },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.data.name).toBe('Test Church');
    expect(body.data.slug).toBe(slug);
    expect(body.data.privacyMode).toBe('open');
    churchId = body.data.id;
  });

  it('GET /api/v1/churches/:id — returns the church', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/churches/${churchId}` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.id).toBe(churchId);
  });

  it('GET /api/v1/churches/slug/:slug — returns the church by slug', async () => {
    const res = await fastify.inject({ method: 'GET', url: `/api/v1/churches/slug/${slug}` });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.slug).toBe(slug);
  });

  it('PATCH /api/v1/churches/:id — updates privacy mode', async () => {
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/churches/${churchId}`,
      payload: { privacyMode: 'strict' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.privacyMode).toBe('strict');
  });

  it('POST /api/v1/churches — rejects duplicate slug', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: 'Another Church', slug },
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/v1/churches — auto-generates slug from name', async () => {
    const uniqueName = `Auto Slug Church ${Date.now()}`;
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/churches',
      payload: { name: uniqueName },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.data.slug).toMatch(/^auto-slug-church-/);
  });
});
