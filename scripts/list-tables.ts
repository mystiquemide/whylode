import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

async function listTables() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log('Tables in public schema:');
  (rows as Array<{ tablename: string }>).forEach((r) => console.log(' ', r.tablename));
}

listTables().catch((err) => { console.error(err); process.exit(1); });
