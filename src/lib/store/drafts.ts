import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function submitDraft(
  change_id: number,
  diff: string,
  reasons: Array<{ file: string; line_no: number; note_id?: number; clause_id?: number }>,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ draft_id: number }> {
  // Refuse while any question is open.
  const openQuestions = await db`
    SELECT id FROM questions WHERE change_id = ${change_id} AND state = 'open' LIMIT 1
  `;
  if (openQuestions.length > 0) {
    throw new Error('Draft refused: there are open questions. Answer all questions before submitting.');
  }

  // Refuse while any conflict is open.
  const openConflicts = await db`
    SELECT id FROM conflicts WHERE change_id = ${change_id} AND state = 'open' LIMIT 1
  `;
  if (openConflicts.length > 0) {
    throw new Error('Draft refused: there are open conflicts. Resolve all conflicts before submitting.');
  }

  const draftRows = await db`
    INSERT INTO drafts (change_id, diff) VALUES (${change_id}, ${diff}) RETURNING id
  `;
  const draft_id = (draftRows[0] as { id: number }).id;

  for (const r of reasons) {
    const note_id = r.note_id ?? null;
    const clause_id = r.clause_id ?? null;
    await db`
      INSERT INTO draft_reasons (draft_id, file, line_no, note_id, clause_id)
      VALUES (${draft_id}, ${r.file}, ${r.line_no}, ${note_id}, ${clause_id})
    `;
  }

  await insertEvent(change_id, 'draft_submitted', { draft_id }, db);

  return { draft_id };
}

export async function approveDraft(
  draft_id: number,
  decided_by: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<void> {
  const rows = await db`
    SELECT id, change_id FROM drafts WHERE id = ${draft_id}
  `;
  const draft = rows[0] as { id: number; change_id: number } | undefined;
  if (!draft) throw new Error(`Draft ${draft_id} not found`);

  await db`
    UPDATE drafts SET state = 'approved', decided_by = ${decided_by}, decided_at = now()
    WHERE id = ${draft_id}
  `;
  await insertEvent(draft.change_id, 'draft_approved', { draft_id, decided_by }, db);
}

export async function getDraft(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ id: number; diff: string; state: string; decided_by: string | null } | null> {
  const rows = await db`
    SELECT id, diff, state, decided_by FROM drafts WHERE change_id = ${change_id}
    ORDER BY id DESC LIMIT 1
  `;
  return (rows[0] as { id: number; diff: string; state: string; decided_by: string | null }) ?? null;
}
