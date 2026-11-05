import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'flip-production-super-secret-key-2026';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  adminOnly: z.boolean().optional().default(false),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Mobile / Web User Registration
  fastify.post('/api/v1/auth/register', async (req, reply) => {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password, name, phone } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (existing) {
      return reply.status(409).send({
        error: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`;

    const [newUser] = await db
      .insert(users)
      .values({
        id,
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        role: 'user',
        phone: phone?.trim() || null,
        avatarUrl,
        isActive: true,
      })
      .returning();

    // Sign JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return reply.status(201).send({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        avatarUrl: newUser.avatarUrl,
      },
      token,
    });
  });

  // Login (supports both Admin and Shopper mobile logins)
  fastify.post('/api/v1/auth/login', async (req, reply) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password, adminOnly } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return reply.status(403).send({
        error: 'This account has been deactivated. Please contact support.',
      });
    }

    // Verify bcrypt password hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({
        error: 'Invalid email address or password.',
      });
    }

    // Enforce role check if logging into Admin Portal
    if (adminOnly && user.role !== 'admin') {
      return reply.status(403).send({
        error: 'Access denied: Only administrator accounts can access the Admin Portal.',
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return reply.send({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  });

  // Get current user profile from token
  fastify.get('/api/v1/auth/me', async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.id),
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'User session expired or account deactivated' });
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (err) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });
}
