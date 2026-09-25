import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';

export async function upsertProgram(
  name: string,
  description: string,
  source: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ id: number }> {
  const rows = await db`
    INSERT INTO programs (name, description, source, updated_at)
    VALUES (${name}, ${description}, ${source}, now())
    ON CONFLICT (name) DO UPDATE
      SET description = EXCLUDED.description,
          source      = EXCLUDED.source,
          updated_at  = now()
    RETURNING id
  `;
  return rows[0] as { id: number };
}

export async function getProgramByName(
  name: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ id: number; name: string; description: string; source: string } | null> {
  const rows = await db`
    SELECT id, name, description, source FROM programs WHERE name = ${name}
  `;
  return (rows[0] as { id: number; name: string; description: string; source: string }) ?? null;
}

export async function listPrograms(
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; name: string; description: string; note_count: number }>> {
  const rows = await db`
    SELECT
      p.id,
      p.name,
      p.description,
      COUNT(n.id)::int AS note_count
    FROM programs p
    LEFT JOIN notes n ON n.program = p.name
    GROUP BY p.id, p.name, p.description
    ORDER BY p.name
  `;
  return rows as Array<{ id: number; name: string; description: string; note_count: number }>;
}
