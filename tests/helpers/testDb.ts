/**
 * Test helper: creates an isolated Postgres schema per test run,
 * applies db/schema.sql inside it, and returns a neon sql function scoped
 * to that schema. Call teardown() at the end of the suite.
 *
 * Strategy: clone the DATABASE_URL and append ?options=--search_path%3D<schema>
 * so every connection made by neon() lands in the test schema by default.
 * Each DDL statement is run individually (neon HTTP doesn't allow multi-statement).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { neon, neonConfig } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const SCHEMA_SQL = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');

function randomSchemaName(): string {
  return 'test_' + Math.random().toString(36).slice(2, 10);
}

/** Append search_path override to a Postgres connection URL. */
function scopedUrl(baseUrl: string, schema: string): string {
  const url = new URL(baseUrl);
  // options param passes server-side SET commands at connect time.
  url.searchParams.set('options', `--search_path=${schema}`);
  return url.toString();
}

export interface TestDb {
  /** Pass this to any store function instead of the default sql. */
  sql: NeonQueryFunction<false, false>;
  schema: string;
  teardown: () => Promise<void>;
}

export async function createTestDb(): Promise<TestDb> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

  // Root sql (public schema) — used only for schema management.
  const rootSql = neon(process.env.DATABASE_URL);
  const schema = randomSchemaName();

  // Create isolated schema.
  await rootSql.query(`CREATE SCHEMA "${schema}"`);

  // Apply every DDL statement individually inside the test schema.
  const statements = SCHEMA_SQL
    .split(/;/)
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);

  // Use a scoped connection for DDL so tables land in the right schema.
  const schemaSql = neon(scopedUrl(process.env.DATABASE_URL, schema));
  for (const stmt of statements) {
    await schemaSql.query(stmt);
  }

  // Build the scoped sql for store functions — also uses the scoped URL.
  const scopedSqlFn = neon(scopedUrl(process.env.DATABASE_URL, schema));

  const teardown = async () => {
    await rootSql.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  };

  return { sql: scopedSqlFn as NeonQueryFunction<false, false>, schema, teardown };
}
