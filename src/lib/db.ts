import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Use WebSocket for environments that don't have a native one (Node.js).
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// sql is the tagged-template query function for single statements.
export const sql = neon(process.env.DATABASE_URL);
