import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
`;
console.log('Tables in public schema:');
rows.forEach((r: Record<string, unknown>) => console.log(' ', r.tablename));
