import { describe, it, expect } from 'vitest';
import { sql } from '@/lib/db';

// Read-only checks on the shared connection. No tables are touched.
describe('shared sql connection', () => {
  it('works as a tagged template', async () => {
    const rows = await sql`select 1 as one`;
    expect(rows[0]).toEqual({ one: 1 });
  });

  it('returns bigint values as numbers', async () => {
    const rows = await sql`select 42::bigint as id`;
    expect(typeof (rows[0] as { id: unknown }).id).toBe('number');
  });
});
