import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function submitDraft(
  change_id: number,
  diff: string,
  reasons: Array<{ file: string; line_no: number; note_id?: number; clause_id?: number; action?: 'changed' | 'kept' }>,
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
    INSERT INTO drafts (change_id, diff) VALUES (${change_id}, ${diff}) RETURNING id::int AS id
  `;
  const draft_id = (draftRows[0] as { id: number }).id;

  for (const r of reasons) {
    const note_id = r.note_id ?? null;
    const clause_id = r.clause_id ?? null;
    const action = r.action ?? 'changed';
    await db`
      INSERT INTO draft_reasons (draft_id, file, line_no, note_id, clause_id, action)
      VALUES (${draft_id}, ${r.file}, ${r.line_no}, ${note_id}, ${clause_id}, ${action})
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
    SELECT id::int AS id, change_id::int AS change_id FROM drafts WHERE id = ${draft_id}
  `;
  const draft = rows[0] as { id: number; change_id: number } | undefined;
  if (!draft) throw new Error(`Draft ${draft_id} not found`);

  await db`
    UPDATE drafts SET state = 'approved', decided_by = ${decided_by}, decided_at = now()
    WHERE id = ${draft_id}
  `;
  await insertEvent(draft.change_id, 'draft_approved', { draft_id, decided_by }, db);
}

export type DraftReason = {
  file: string;
  line_no: number;
  action: 'changed' | 'kept';
  note_id: number | null;
  note_text: string | null;
  note_author: string | null;
  clause_id: number | null;
  clause_text: string | null;
};

export async function getDraft(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ id: number; diff: string; state: string; decided_by: string | null; decided_at: string | null; reasons: DraftReason[] } | null> {
  const rows = await db`
    SELECT id, diff, state, decided_by, decided_at FROM drafts WHERE change_id = ${change_id}
    ORDER BY id DESC LIMIT 1
  `;
  const draft = rows[0] as { id: number; diff: string; state: string; decided_by: string | null; decided_at: string | null } | undefined;
  if (!draft) return null;
  const reasons = await db`
    SELECT r.file, r.line_no, r.action, r.note_id, n.text AS note_text, n.author AS note_author,
           r.clause_id, c.text AS clause_text
    FROM draft_reasons r
    LEFT JOIN notes n ON n.id = r.note_id
    LEFT JOIN clauses c ON c.id = r.clause_id
    WHERE r.draft_id = ${draft.id}
    ORDER BY r.file, r.line_no
  `;
  return { ...draft, reasons: reasons as DraftReason[] };
}

/**
 * Approve or request changes on a change's latest draft. Only a pending draft
 * can be decided, and never while a conflict is open.
 */
export async function decideDraft(
  change_id: number,
  decision: 'approved' | 'changes_requested',
  decided_by: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ draft_id: number }> {
  const draft = await getDraft(change_id, db);
  if (!draft) throw new Error('There is no draft for this change yet.');
  if (draft.state !== 'pending') throw new Error('This draft has already been decided.');

  const open = await db`
    SELECT id FROM conflicts WHERE change_id = ${change_id} AND state = 'open' LIMIT 1
  `;
  if (open.length > 0) throw new Error('Review the open conflict before deciding.');

  await db`
    UPDATE drafts SET state = ${decision}, decided_by = ${decided_by}, decided_at = now()
    WHERE id = ${draft.id}
  `;
  await insertEvent(
    change_id,
    decision === 'approved' ? 'draft_approved' : 'draft_changes_requested',
    { draft_id: draft.id, decided_by },
    db,
  );
  return { draft_id: draft.id };
}
