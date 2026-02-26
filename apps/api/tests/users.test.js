import fastify from '../src/index.js';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

beforeAll(async () => {
  // ensure database is ready
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

describe('User endpoints', () => {
  let createdId;
  const uniqueEmail = `vitest+${Date.now()}@example.com`;

  it('should create a user', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/v1/users',
      payload: { email: uniqueEmail, displayName: 'Vitester' },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data).toHaveProperty('id');
    createdId = body.data.id;
  });

  it('should fetch the user profile', async () => {
    expect(createdId).toBeDefined();
    const res = await fastify.inject({
      method: 'GET',
      url: `/api/v1/users/${createdId}`,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.email).toBe(uniqueEmail);
  });

  it('should update the user', async () => {
    expect(createdId).toBeDefined();
    const res = await fastify.inject({
      method: 'PATCH',
      url: `/api/v1/users/${createdId}`,
      payload: { displayName: 'Updated' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.displayName).toBe('Updated');
  });
});
