/**
 * scripts/reset-public.ts
 *
 * Cleans up test pollution from the production (public) schema:
 *   1. TRUNCATEs every table in public RESTART IDENTITY CASCADE.
 *   2. DROPs every schema whose name starts with "test_".
 *   3. Prints row counts for every public table (all must be 0).
 *
 * Run once after discovering test rows leaked into public:
 *   npm run db:reset-public
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

async function resetPublic() {
  const sql = neon(process.env.DATABASE_URL!);

  // ── 1. Find all user tables in public schema ──────────────────────────────
  const tableRows = await sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const tables = (tableRows as Array<{ tablename: string }>).map((r) => r.tablename);

  if (tables.length === 0) {
    console.log('No tables found in public schema.');
  } else {
    // Build a single TRUNCATE statement for all tables with CASCADE.
    const tableList = tables.map((t) => `"public"."${t}"`).join(', ');
    console.log(`Truncating ${tables.length} table(s): ${tables.join(', ')}`);
    await sql.query(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`);
    console.log('Truncate complete.');
  }

  // ── 2. Drop schemas whose name starts with "test_" ────────────────────────
  const schemaRows = await sql`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'test_%'
  `;
  const testSchemas = (schemaRows as Array<{ schema_name: string }>).map((r) => r.schema_name);

  if (testSchemas.length === 0) {
    console.log('No test_ schemas to drop.');
  } else {
    for (const s of testSchemas) {
      console.log(`Dropping schema "${s}" CASCADE …`);
      await sql.query(`DROP SCHEMA IF EXISTS "${s}" CASCADE`);
    }
    console.log(`Dropped ${testSchemas.length} test schema(s).`);
  }

  // ── 3. Print row counts for every public table ────────────────────────────
  // Fetch all counts in one query to avoid N round-trips.
  console.log('\nRow counts after reset:');
  for (const t of tables) {
    // Use a parameterised literal: the table name is not user input so
    // building the SQL string directly is safe here.
    const rows = (await sql.query(
      `SELECT COUNT(*)::int AS n FROM "public"."${t}"`,
    )) as unknown as Array<{ n: number }>;
    const n = Array.isArray(rows) ? rows[0].n : (rows as { rows: Array<{ n: number }> }).rows[0].n;
    console.log(`  ${t}: ${n}`);
  }
}

resetPublic().catch((err) => {
  console.error(err);
  process.exit(1);
});
