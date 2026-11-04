import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set in environment.');
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
