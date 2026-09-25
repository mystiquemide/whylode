import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function openChange(
  title: string,
  source_file: string,
  clauseTexts: string[],
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ change_id: number; clause_ids: number[] }> {
  const changeRows = await db`
    INSERT INTO changes (title, source_file) VALUES (${title}, ${source_file}) RETURNING id
  `;
  const change_id = (changeRows[0] as { id: number }).id;

  const clause_ids: number[] = [];
  for (let i = 0; i < clauseTexts.length; i++) {
    const rows = await db`
      INSERT INTO clauses (change_id, position, text) VALUES (${change_id}, ${i}, ${clauseTexts[i]}) RETURNING id
    `;
    clause_ids.push((rows[0] as { id: number }).id);
  }

  await insertEvent(change_id, 'change_opened', { title, source_file, clause_count: clauseTexts.length }, db);

  return { change_id, clause_ids };
}

export async function getChange(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{
  id: number;
  title: string;
  source_file: string;
  status: string;
  questions_asked: number;
  lines_reused: number;
  created_at: Date;
} | null> {
  const rows = await db`
    SELECT
      c.id,
      c.title,
      c.source_file,
      c.created_at,
      -- derived status
      CASE
        WHEN EXISTS (
          SELECT 1 FROM drafts d
          WHERE d.change_id = c.id AND d.state = 'approved'
        ) THEN 'approved'
        WHEN EXISTS (
          SELECT 1 FROM drafts d
          WHERE d.change_id = c.id
            AND d.state = 'pending'
            AND NOT EXISTS (
              SELECT 1 FROM questions q WHERE q.change_id = c.id AND q.state = 'open'
            )
            AND NOT EXISTS (
              SELECT 1 FROM conflicts cf WHERE cf.change_id = c.id AND cf.state = 'open'
            )
        ) THEN 'ready'
        WHEN EXISTS (
          SELECT 1 FROM questions q WHERE q.change_id = c.id AND q.state = 'open'
        ) THEN 'waiting'
        ELSE 'open'
      END AS status,
      -- questions_asked: count of questions created for this change
      (SELECT COUNT(*)::int FROM questions q WHERE q.change_id = c.id) AS questions_asked,
      -- lines_reused: count of trace lines marked known
      (SELECT COUNT(*)::int FROM trace_lines tl
        JOIN clauses cl ON cl.id = tl.clause_id
        WHERE cl.change_id = c.id AND tl.state = 'known'
      ) AS lines_reused
    FROM changes c
    WHERE c.id = ${change_id}
  `;
  return (rows[0] as {
    id: number; title: string; source_file: string; status: string;
    questions_asked: number; lines_reused: number; created_at: Date;
  }) ?? null;
}

export async function listChanges(
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; title: string; source_file: string; status: string; created_at: Date }>> {
  const rows = await db`
    SELECT
      c.id,
      c.title,
      c.source_file,
      c.created_at,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM drafts d WHERE d.change_id = c.id AND d.state = 'approved'
        ) THEN 'approved'
        WHEN EXISTS (
          SELECT 1 FROM drafts d WHERE d.change_id = c.id AND d.state = 'pending'
            AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.change_id = c.id AND q.state = 'open')
            AND NOT EXISTS (SELECT 1 FROM conflicts cf WHERE cf.change_id = c.id AND cf.state = 'open')
        ) THEN 'ready'
        WHEN EXISTS (
          SELECT 1 FROM questions q WHERE q.change_id = c.id AND q.state = 'open'
        ) THEN 'waiting'
        ELSE 'open'
      END AS status
    FROM changes c
    ORDER BY c.created_at DESC
  `;
  return rows as Array<{ id: number; title: string; source_file: string; status: string; created_at: Date }>;
}

export async function getClauses(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; position: number; text: string }>> {
  const rows = await db`
    SELECT id, position, text FROM clauses WHERE change_id = ${change_id} ORDER BY position
  `;
  return rows as Array<{ id: number; position: number; text: string }>;
}
