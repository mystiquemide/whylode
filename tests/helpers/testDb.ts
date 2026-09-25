/**
 * Test helper: connects to a dedicated `whylode_test` database in the same
 * Neon project, drops and recreates all tables, and returns a neon() sql
 * function bound to that database. Call teardown() at the end of each suite.
 *
 * Strategy: build the test URL by replacing the database name in the URL
 * path with "whylode_test". The Neon HTTP driver ignores search_path in the
 * URL, so schema isolation via a separate database is the only reliable option.
 *
 * Hard guard: createTestDb() throws if current_database() is not 'whylode_test',
 * ensuring tests can never run against the production database.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { neon, neonConfig } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const SCHEMA_SQL = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
const TEST_DB_NAME = 'whylode_test';

/** Replace the database name in the Postgres URL path with `whylode_test`. */
function testDbUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  // The path is "/<dbname>" or "/<dbname>?…".
  const parts = url.pathname.split('/');
  parts[1] = TEST_DB_NAME;
  url.pathname = parts.join('/');
  return url.toString();
}

export interface TestDb {
  /** Pass this to any store function instead of the default sql. */
  sql: NeonQueryFunction<false, false>;
  teardown: () => Promise<void>;
}

export async function createTestDb(): Promise<TestDb> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

  // ── 1. Ensure whylode_test database exists ─────────────────────────────────
  // CREATE DATABASE cannot run inside a transaction; use the admin (root) URL.
  const rootSql = neon(process.env.DATABASE_URL);
  const existing = await rootSql`
    SELECT 1 FROM pg_database WHERE datname = ${TEST_DB_NAME}
  `;
  if (existing.length === 0) {
    // neon HTTP driver executes each tagged-template call as a single statement.
    // CREATE DATABASE is not allowed in a transaction block, so use .query()
    // which sends it as a simple query outside an implicit transaction.
    await rootSql.query(`CREATE DATABASE ${TEST_DB_NAME}`);
  }

  // ── 2. Connect to whylode_test ─────────────────────────────────────────────
  const url = testDbUrl(process.env.DATABASE_URL);
  const sql = neon(url);

  // ── 3. Hard guard ──────────────────────────────────────────────────────────
  const dbCheck = await sql`SELECT current_database() AS db`;
  const currentDb = (dbCheck[0] as { db: string }).db;
  if (currentDb !== TEST_DB_NAME) {
    throw new Error(
      `Safety check failed: connected to "${currentDb}" instead of "${TEST_DB_NAME}". ` +
      `Tests must never run against the production database.`,
    );
  }

  // ── 4. Drop all tables in dependency order, then recreate from schema.sql ──
  // Drop in reverse dependency order (cascade handles FK chains).
  const tables = [
    'events', 'draft_reasons', 'drafts', 'conflicts',
    'trace_lines', 'notes', 'questions', 'experts',
    'clauses', 'changes', 'programs',
  ];
  for (const t of tables) {
    await sql.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
  }

  const statements = SCHEMA_SQL
    .split(/;/)
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await sql.query(stmt);
  }

  const teardown = async () => {
    // Nothing to do: the next run will drop-and-recreate all tables.
  };

  return { sql: sql as NeonQueryFunction<false, false>, teardown };
}
