export default async function healthRoutes(fastify) {
  fastify.get('/api/v1/health', async () => ({ status: 'ok' }));
}
