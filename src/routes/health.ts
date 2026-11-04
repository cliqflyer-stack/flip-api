import { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_req, reply) => {
    try {
      await db.execute(sql`SELECT 1`);
      return reply.send({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(503).send({
        status: 'error',
        database: 'disconnected',
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}
