import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/upload', async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' });
    }

    const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(data.filename) || '.jpg';
    const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const targetPath = path.join(uploadDir, safeName);

    await pipeline(data.file, fs.createWriteStream(targetPath));

    const publicUrl = `/uploads/${safeName}`;
    return reply.status(201).send({
      success: true,
      filename: safeName,
      url: publicUrl,
    });
  });
}
