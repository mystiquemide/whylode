import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';

export async function insertEvent(
  change_id: number,
  kind: string,
  detail: Record<string, unknown>,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<void> {
  await db`
    INSERT INTO events (change_id, kind, detail) VALUES (${change_id}, ${kind}, ${JSON.stringify(detail)})
  `;
}

export async function getEvents(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; kind: string; detail: Record<string, unknown>; at: Date }>> {
  const rows = await db`
    SELECT id, kind, detail, at FROM events WHERE change_id = ${change_id} ORDER BY at ASC, id ASC
  `;
  return rows as Array<{ id: number; kind: string; detail: Record<string, unknown>; at: Date }>;
}
