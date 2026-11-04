import { FastifyInstance } from 'fastify';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { flyers, flyerPages, hotspots } from '../db/schema.js';
import { z } from 'zod';

const flyerSchema = z.object({
  id: z.string().optional(),
  merchantId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  badgeText: z.string().default('NEW'),
  badgeVariant: z.string().default('lime'),
  validFrom: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  validTo: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  flyerImageUrl: z.string().min(1),
  aspectRatio: z.number().default(1.414),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  pageCount: z.number().default(1),
});

const hotspotItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  flyerPageId: z.string().optional(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
  titleOverride: z.string().optional(),
  priceOverride: z.string().optional(),
});

const batchHotspotsSchema = z.object({
  hotspots: z.array(hotspotItemSchema),
});

export async function flyerRoutes(fastify: FastifyInstance) {
  // List all flyers
  fastify.get<{ Querystring: { status?: string; merchantId?: string } }>(
    '/api/v1/flyers',
    async (req, reply) => {
      const { status, merchantId } = req.query;
      const conditions = [];

      if (status) {
        conditions.push(eq(flyers.status, status));
      }
      if (merchantId) {
        conditions.push(eq(flyers.merchantId, merchantId));
      }

      const list = await db.query.flyers.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          merchant: true,
          pages: true,
          hotspots: {
            with: {
              product: true,
            },
          },
        },
        orderBy: [desc(flyers.createdAt)],
      });
      return reply.send(list);
    }
  );

  // Get flyer by ID (with merchant, pages, and all hotspots + products)
  fastify.get<{ Params: { id: string } }>('/api/v1/flyers/:id', async (req, reply) => {
    const flyer = await db.query.flyers.findFirst({
      where: eq(flyers.id, req.params.id),
      with: {
        merchant: true,
        pages: {
          orderBy: [flyerPages.pageNumber],
        },
        hotspots: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!flyer) {
      return reply.status(404).send({ error: 'Flyer not found' });
    }
    return reply.send(flyer);
  });

  // Create flyer
  fastify.post('/api/v1/flyers', async (req, reply) => {
    const parsed = flyerSchema.parse(req.body);
    const id = parsed.id || `flyer_${Date.now().toString(36)}`;
    const [inserted] = await db
      .insert(flyers)
      .values({ ...parsed, id })
      .returning();

    // Automatically create page 1 for the flyer
    await db.insert(flyerPages).values({
      id: `page_${id}_1`,
      flyerId: id,
      pageNumber: 1,
      imageUrl: parsed.flyerImageUrl,
      aspectRatio: parsed.aspectRatio,
    });

    return reply.status(201).send(inserted);
  });

  // Update flyer
  fastify.put<{ Params: { id: string } }>('/api/v1/flyers/:id', async (req, reply) => {
    const parsed = flyerSchema.partial().parse(req.body);
    const [updated] = await db
      .update(flyers)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(flyers.id, req.params.id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: 'Flyer not found' });
    }
    return reply.send(updated);
  });

  // Delete flyer
  fastify.delete<{ Params: { id: string } }>('/api/v1/flyers/:id', async (req, reply) => {
    const [deleted] = await db.delete(flyers).where(eq(flyers.id, req.params.id)).returning();
    if (!deleted) {
      return reply.status(404).send({ error: 'Flyer not found' });
    }
    return reply.send({ success: true, deletedId: deleted.id });
  });

  // Get hotspots for a flyer
  fastify.get<{ Params: { id: string } }>('/api/v1/flyers/:id/hotspots', async (req, reply) => {
    const list = await db.query.hotspots.findMany({
      where: eq(hotspots.flyerId, req.params.id),
      with: {
        product: true,
      },
    });
    return reply.send(list);
  });

  // Batch save hotspots for a flyer (from the Admin Konva Editor Canvas)
  fastify.post<{ Params: { id: string } }>(
    '/api/v1/flyers/:id/hotspots/batch',
    async (req, reply) => {
      const flyerId = req.params.id;
      const { hotspots: items } = batchHotspotsSchema.parse(req.body);

      // Verify flyer exists
      const flyer = await db.query.flyers.findFirst({
        where: eq(flyers.id, flyerId),
      });
      if (!flyer) {
        return reply.status(404).send({ error: 'Flyer not found' });
      }

      // First delete existing hotspots for this flyer
      await db.delete(hotspots).where(eq(hotspots.flyerId, flyerId));

      if (items.length === 0) {
        return reply.send({ success: true, count: 0, hotspots: [] });
      }

      // Insert new batch of hotspots
      const newHotspots = items.map((item) => ({
        id: item.id || `hs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        flyerId,
        flyerPageId: item.flyerPageId || null,
        productId: item.productId,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        titleOverride: item.titleOverride || null,
        priceOverride: item.priceOverride || null,
      }));

      const inserted = await db.insert(hotspots).values(newHotspots).returning();

      // Return inserted hotspots with their product details
      const result = await db.query.hotspots.findMany({
        where: eq(hotspots.flyerId, flyerId),
        with: {
          product: true,
        },
      });

      return reply.send({ success: true, count: inserted.length, hotspots: result });
    }
  );
}
