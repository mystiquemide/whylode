import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function flagConflict(
  change_id: number,
  note_id: number,
  claim: string,
  code_fact: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ conflict_id: number }> {
  const rows = await db`
    INSERT INTO conflicts (change_id, note_id, claim, code_fact)
    VALUES (${change_id}, ${note_id}, ${claim}, ${code_fact})
    RETURNING id::int AS id
  `;
  const conflict_id = (rows[0] as { id: number }).id;
  await insertEvent(change_id, 'conflict_flagged', { conflict_id, note_id }, db);
  return { conflict_id };
}

export async function reviewConflict(
  conflict_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<void> {
  const rows = await db`
    SELECT id::int AS id, change_id::int AS change_id FROM conflicts WHERE id = ${conflict_id}
  `;
  const conflict = rows[0] as { id: number; change_id: number } | undefined;
  if (!conflict) throw new Error(`Conflict ${conflict_id} not found`);

  await db`UPDATE conflicts SET state = 'reviewed' WHERE id = ${conflict_id}`;
  await insertEvent(conflict.change_id, 'conflict_reviewed', { conflict_id }, db);
}

export async function getOpenConflicts(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; note_id: number | null; claim: string; code_fact: string }>> {
  const rows = await db`
    SELECT id, note_id, claim, code_fact FROM conflicts
    WHERE change_id = ${change_id} AND state = 'open'
  `;
  return rows as Array<{ id: number; note_id: number | null; claim: string; code_fact: string }>;
}
