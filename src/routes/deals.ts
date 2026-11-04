import { FastifyInstance } from 'fastify';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { deals } from '../db/schema.js';
import { z } from 'zod';

const dealSchema = z.object({
  id: z.string().optional(),
  merchantId: z.string().optional(),
  productId: z.string().optional(),
  flyerId: z.string().optional(),
  title: z.string().min(1),
  details: z.string().optional(),
  priceText: z.string().min(1),
  discountPercent: z.number().optional(),
  badgeText: z.string().optional(),
  imageUrl: z.string().min(1),
  isFeatured: z.boolean().default(false),
});

export async function dealRoutes(fastify: FastifyInstance) {
  // List deals
  fastify.get<{ Querystring: { featured?: string; merchantId?: string } }>(
    '/api/v1/deals',
    async (req, reply) => {
      const { featured, merchantId } = req.query;
      const conditions = [];

      if (featured === 'true') {
        conditions.push(eq(deals.isFeatured, true));
      }
      if (merchantId) {
        conditions.push(eq(deals.merchantId, merchantId));
      }

      const list = await db.query.deals.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          merchant: true,
          product: true,
        },
        orderBy: [desc(deals.createdAt)],
      });
      return reply.send(list);
    }
  );

  // Create deal
  fastify.post('/api/v1/deals', async (req, reply) => {
    const parsed = dealSchema.parse(req.body);
    const id = parsed.id || `deal_${Date.now().toString(36)}`;
    const [inserted] = await db
      .insert(deals)
      .values({ ...parsed, id })
      .returning();
    return reply.status(201).send(inserted);
  });
}
