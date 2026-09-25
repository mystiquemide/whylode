/**
 * Test helper: creates an isolated Postgres schema per test run,
 * applies db/schema.sql inside it, and returns a neon sql function scoped
 * to that schema via search_path. Call teardown() at the end of the suite.
 *
 * Strategy: each store function accepts an optional `db` parameter.
 * We pass a wrapped sql function that sets search_path before each query.
 * The neon HTTP driver opens a new connection per query, so we prefix the
 * DDL and DML with `SET search_path TO <schema>` in a single transaction block.
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
    // Use rootSql with a raw template that embeds the search_path directive.
    // We cannot pass parameters here (DDL has none), so string interpolation
    // of the schema name is safe — it is generated internally, not user input.
    await rootSql([`SET search_path TO "${schema}"; ${stmt}`] as unknown as TemplateStringsArray);
  }

  // Build a sql function that prepends SET search_path to every query.
  // This works because neon() creates a new HTTP request per call.
  const makeScopedSql = (): NeonQueryFunction<false, false> => {
    return Object.assign(
      async function scopedQuery(
        strings: TemplateStringsArray,
        ...values: unknown[]
      ) {
        // Build a single string with parameter placeholders.
        const parts = Array.from(strings.raw ?? strings);
        let query = '';
        for (let i = 0; i < parts.length; i++) {
          query += parts[i];
          if (i < values.length) query += `$${i + 1}`;
        }
        // Prepend search_path directive.
        const full = `SET search_path TO "${schema}"; ${query}`;
        return rootSql([full] as unknown as TemplateStringsArray, ...values);
      },
      // neon() has extra properties; we only need the function shape for tests.
      { transaction: undefined },
    ) as unknown as NeonQueryFunction<false, false>;
  };

  const teardown = async () => {
    await rootSql`DROP SCHEMA IF EXISTS ${rootSql(schema)} CASCADE`;
  };

  return { sql: makeScopedSql(), schema, teardown };
}
