import { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { flyers, products, merchants, hotspots } from '../db/schema.js';

export async function statsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/stats', async (_req, reply) => {
    const [flyerCount] = await db.select({ count: sql<number>`count(*)` }).from(flyers);
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [merchantCount] = await db.select({ count: sql<number>`count(*)` }).from(merchants);
    const [hotspotCount] = await db.select({ count: sql<number>`count(*)` }).from(hotspots);

    return reply.send({
      flyers: Number(flyerCount.count),
      products: Number(productCount.count),
      merchants: Number(merchantCount.count),
      hotspots: Number(hotspotCount.count),
    });
  });
}
