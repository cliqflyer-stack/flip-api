import { FastifyInstance } from 'fastify';
import { eq, desc, ilike, or, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { products } from '../db/schema.js';
import { z } from 'zod';

const productSchema = z.object({
  id: z.string().optional(),
  merchantId: z.string().optional(),
  name: z.string().min(1),
  brand: z.string().default(''),
  description: z.string().default(''),
  regularPrice: z.string().or(z.number().transform((n) => n.toString())),
  offerPrice: z.string().or(z.number().transform((n) => n.toString())),
  unit: z.string().default('each'),
  category: z.string().default('General'),
  sku: z.string().optional(),
  imageUrl: z.string().min(1),
});

export async function productRoutes(fastify: FastifyInstance) {
  // List products with optional search query & category filter
  fastify.get<{ Querystring: { q?: string; category?: string; merchantId?: string } }>(
    '/api/v1/products',
    async (req, reply) => {
      const { q, category, merchantId } = req.query;
      const conditions = [];

      if (category) {
        conditions.push(eq(products.category, category));
      }
      if (merchantId) {
        conditions.push(eq(products.merchantId, merchantId));
      }
      if (q) {
        conditions.push(
          or(
            ilike(products.name, `%${q}%`),
            ilike(products.brand, `%${q}%`),
            ilike(products.category, `%${q}%`)
          )
        );
      }

      const list = await db.query.products.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          merchant: true,
        },
        orderBy: [desc(products.createdAt)],
      });

      return reply.send(list);
    }
  );

  // Get product by ID
  fastify.get<{ Params: { id: string } }>('/api/v1/products/:id', async (req, reply) => {
    const product = await db.query.products.findFirst({
      where: eq(products.id, req.params.id),
      with: {
        merchant: true,
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.send(product);
  });

  // Create product
  fastify.post('/api/v1/products', async (req, reply) => {
    const parsed = productSchema.parse(req.body);
    const id = parsed.id || `prod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const [inserted] = await db
      .insert(products)
      .values({
        ...parsed,
        id,
      })
      .returning();
    return reply.status(201).send(inserted);
  });

  // Update product
  fastify.put<{ Params: { id: string } }>('/api/v1/products/:id', async (req, reply) => {
    const parsed = productSchema.partial().parse(req.body);
    const [updated] = await db
      .update(products)
      .set(parsed)
      .where(eq(products.id, req.params.id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.send(updated);
  });

  // Delete product
  fastify.delete<{ Params: { id: string } }>('/api/v1/products/:id', async (req, reply) => {
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, req.params.id))
      .returning();

    if (!deleted) {
      return reply.status(404).send({ error: 'Product not found' });
    }
    return reply.send({ success: true, deletedId: deleted.id });
  });
}
