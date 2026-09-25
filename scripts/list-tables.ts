import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

async function listTables() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  const tables = (rows as Array<{ tablename: string }>).map((r) => r.tablename);
  console.log('Tables in public schema:');
  for (const t of tables) {
    const cnt = await sql.query(`SELECT COUNT(*)::int AS n FROM "public"."${t}"`);
    const n = (Array.isArray(cnt) ? cnt[0] : (cnt as { rows: Array<{ n: number }> }).rows[0]).n;
    console.log(`  ${t}: ${n} rows`);
  }
}

listTables().catch((err) => { console.error(err); process.exit(1); });
