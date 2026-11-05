import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

import { healthRoutes } from './routes/health.js';
import { merchantRoutes } from './routes/merchants.js';
import { flyerRoutes } from './routes/flyers.js';
import { productRoutes } from './routes/products.js';
import { dealRoutes } from './routes/deals.js';
import { statsRoutes } from './routes/stats.js';
import { uploadRoutes } from './routes/upload.js';
import { authRoutes } from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Enable CORS for Admin (Vercel) & Mobile App
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Multipart form-data for image uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024, // 25 MB max flyer size
    },
  });

  // Serve static assets (uploaded images & flyers)
  const uploadDir = path.resolve(__dirname, '../uploads');
  await fastify.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Register all API routes
  await fastify.register(healthRoutes);
  await fastify.register(merchantRoutes);
  await fastify.register(flyerRoutes);
  await fastify.register(productRoutes);
  await fastify.register(dealRoutes);
  await fastify.register(statsRoutes);
  await fastify.register(uploadRoutes);
  await fastify.register(authRoutes);

  // Root route
  fastify.get('/', async (_req, reply) => {
    return reply.send({
      name: 'Flip Interactive Flyer API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        health: '/health',
        auth: '/api/v1/auth',
        merchants: '/api/v1/merchants',
        flyers: '/api/v1/flyers',
        products: '/api/v1/products',
        deals: '/api/v1/deals',
        stats: '/api/v1/stats',
        upload: '/api/v1/upload',
      },
    });
  });

  const port = Number(process.env.PORT) || 3001;
  const host = '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Flip API Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
