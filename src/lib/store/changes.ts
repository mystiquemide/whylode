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
      INSERT INTO clauses (change_id, position, text) VALUES (${change_id}, ${i}, ${clauseTexts[i]}) RETURNING id::int AS id
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
      c.id::int AS id,
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

export type ChangeSummary = {
  id: number;
  title: string;
  source_file: string;
  status: string;
  created_at: string;
  questions_asked: number;
  questions_open: number;
  lines_changed: number;
  lines_kept: number;
  lines_reused: number;
};

/** Every change with its status and real counts from the store, newest first. */
export async function listChangeSummaries(
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<ChangeSummary[]> {
  const base = await listChanges(db);
  const counts = await db`
    SELECT c.id,
      (SELECT count(*) FROM questions q WHERE q.change_id = c.id)::int AS questions_asked,
      (SELECT count(*) FROM questions q WHERE q.change_id = c.id AND q.state = 'open')::int AS questions_open,
      (SELECT count(*) FROM trace_lines t JOIN clauses cl ON cl.id = t.clause_id
        WHERE cl.change_id = c.id AND t.state = 'known')::int AS lines_reused,
      (SELECT count(*) FROM draft_reasons r JOIN drafts d ON d.id = r.draft_id
        WHERE d.id = (SELECT max(id) FROM drafts WHERE change_id = c.id) AND r.action = 'changed')::int AS lines_changed,
      (SELECT count(*) FROM draft_reasons r JOIN drafts d ON d.id = r.draft_id
        WHERE d.id = (SELECT max(id) FROM drafts WHERE change_id = c.id) AND r.action = 'kept')::int AS lines_kept
    FROM changes c
  `;
  const byId = new Map((counts as Array<Record<string, number>>).map((r) => [Number(r.id), r]));
  return base.map((c) => {
    const n = byId.get(Number(c.id));
    return {
      ...c,
      created_at: String(c.created_at),
      questions_asked: n?.questions_asked ?? 0,
      questions_open: n?.questions_open ?? 0,
      lines_changed: n?.lines_changed ?? 0,
      lines_kept: n?.lines_kept ?? 0,
      lines_reused: n?.lines_reused ?? 0,
    };
  });
}
