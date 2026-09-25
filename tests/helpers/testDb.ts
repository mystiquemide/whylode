/**
 * Test helper: creates an isolated Postgres schema per test run,
 * applies db/schema.sql inside it, and returns a neon sql function scoped
 * to that schema via search_path. Call teardown() at the end of the suite.
 *
 * Strategy: each store function accepts an optional `db` parameter.
 * We pass a wrapped sql function that sets search_path before each query.
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

export interface TestDb {
  /** Pass this to any store function instead of the default sql. */
  sql: NeonQueryFunction<false, false>;
  schema: string;
  teardown: () => Promise<void>;
}

export async function createTestDb(): Promise<TestDb> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

  const rootSql = neon(process.env.DATABASE_URL);
  const schema = randomSchemaName();

  // Create isolated schema.
  await rootSql`CREATE SCHEMA ${rootSql(schema)}`;

  // Apply every DDL statement with search_path set first.
  const statements = SCHEMA_SQL
    .split(/;/)
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    // sql.query() accepts a plain string — safe because schema name is
    // internally generated (not user input) and stmt comes from our own file.
    await rootSql.query(`SET search_path TO "${schema}"; ${stmt}`);
  }

  // Build a scoped sql function that prepends SET search_path to every query.
  // Uses sql.query() with explicit parameter arrays so we keep full
  // parameterization for user-supplied values.
  const makeScopedSql = (): NeonQueryFunction<false, false> => {
    const fn = async function scopedQuery(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) {
      // Reconstruct the SQL string from the tagged-template parts,
      // replacing each interpolated value with a $N placeholder.
      const parts = Array.from(strings.raw ?? strings);
      let query = '';
      for (let i = 0; i < parts.length; i++) {
        query += parts[i];
        if (i < values.length) query += `$${i + 1}`;
      }
      // Run with search_path + parameterized values.
      return rootSql.query(
        `SET search_path TO "${schema}"; ${query}`,
        values as unknown[],
      );
    };
    return fn as unknown as NeonQueryFunction<false, false>;
  };

  const teardown = async () => {
    await rootSql`DROP SCHEMA IF EXISTS ${rootSql(schema)} CASCADE`;
  };

  return { sql: makeScopedSql(), schema, teardown };
}
