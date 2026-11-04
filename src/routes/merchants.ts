import { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { merchants, storeLocations } from '../db/schema.js';
import { z } from 'zod';

const merchantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  initial: z.string().default('M'),
  logoBg: z.string().default('#075E50'),
  logoColor: z.string().default('#FFFFFF'),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  categoryId: z.string().optional(),
  website: z.string().optional(),
});

export async function merchantRoutes(fastify: FastifyInstance) {
  // List all merchants
  fastify.get('/api/v1/merchants', async (_req, reply) => {
    const list = await db.query.merchants.findMany({
      with: {
        category: true,
        locations: true,
      },
      orderBy: [desc(merchants.createdAt)],
    });
    return reply.send(list);
  });

  // Get merchant by ID
  fastify.get<{ Params: { id: string } }>('/api/v1/merchants/:id', async (req, reply) => {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, req.params.id),
      with: {
        category: true,
        locations: true,
        flyers: true,
      },
    });

    if (!merchant) {
      return reply.status(404).send({ error: 'Merchant not found' });
    }
    return reply.send(merchant);
  });

  // Create merchant
  fastify.post('/api/v1/merchants', async (req, reply) => {
    const parsed = merchantSchema.parse(req.body);
    const id = parsed.id || `merch_${Date.now().toString(36)}`;
    const [inserted] = await db
      .insert(merchants)
      .values({ ...parsed, id })
      .returning();
    return reply.status(201).send(inserted);
  });

  // Update merchant
  fastify.put<{ Params: { id: string } }>('/api/v1/merchants/:id', async (req, reply) => {
    const parsed = merchantSchema.partial().parse(req.body);
    const [updated] = await db
      .update(merchants)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(merchants.id, req.params.id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: 'Merchant not found' });
    }
    return reply.send(updated);
  });

  // Delete merchant
  fastify.delete<{ Params: { id: string } }>('/api/v1/merchants/:id', async (req, reply) => {
    const [deleted] = await db
      .delete(merchants)
      .where(eq(merchants.id, req.params.id))
      .returning();

    if (!deleted) {
      return reply.status(404).send({ error: 'Merchant not found' });
    }
    return reply.send({ success: true, deletedId: deleted.id });
  });
}
