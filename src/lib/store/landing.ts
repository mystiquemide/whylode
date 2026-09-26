import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';

export type HeroProof = {
  change_id: number;
  file: string;
  line_no: number;
  code: string;
  note: string;
  author: string;
};

/**
 * The most recent approved draft's kept line that an owner's answer justified,
 * with the real source line. Null until such a record exists.
 */
export async function getHeroProof(db: NeonQueryFunction<false, false> = defaultSql): Promise<HeroProof | null> {
  const rows = await db`
    SELECT d.change_id, r.file, r.line_no, n.text AS note, n.author, p.source
    FROM draft_reasons r
    JOIN drafts d ON d.id = r.draft_id AND d.state = 'approved'
    JOIN notes n ON n.id = r.note_id
    JOIN programs p ON p.name = r.file
    WHERE r.action = 'kept'
    ORDER BY d.decided_at DESC, r.line_no
  `;
  if (rows.length === 0) return null;
  const all = rows as Array<{ change_id: number; file: string; line_no: number; note: string; author: string; source: string }>;
  // Prefer the kept line that assigns a literal value (a hardcoded rate), then any assignment.
  const lineOf = (r: (typeof all)[number]) => r.source.split('\n')[r.line_no - 1] ?? '';
  const pick =
    all.find((r) => /EVAL\s+\w+\s*=\s*[\d.]+/.test(lineOf(r))) ??
    all.find((r) => /EVAL\s+\w+\s*=/.test(lineOf(r))) ??
    all[0];
  const code = (pick.source.split('\n')[pick.line_no - 1] ?? '').trim().replace(/\s+/g, ' ');
  return { change_id: Number(pick.change_id), file: pick.file, line_no: pick.line_no, code, note: pick.note, author: pick.author };
}

export type RunSnapshot = {
  change_id: number;
  title: string;
  traced: { file: string; line_no: number; confidence: number; code: string } | null;
  question: { file: string; line_start: number; line_end: number; text: string } | null;
  note: { file: string; line_start: number; line_end: number; text: string; author: string } | null;
  diff: { removed: string; added: string } | null;
  approved_by: string | null;
};

/** Real pieces of one approved change, one per step of the workflow. */
export async function getRunSnapshot(
  changeId: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<RunSnapshot | null> {
  const drafts = await db`
    SELECT d.change_id, d.diff, d.decided_by, c.title FROM drafts d JOIN changes c ON c.id = d.change_id
    WHERE d.state = 'approved' AND d.change_id = ${changeId} ORDER BY d.decided_at DESC LIMIT 1
  `;
  const d = drafts[0] as { change_id: number; diff: string; decided_by: string | null; title: string } | undefined;
  if (!d) return null;
  const change_id = Number(d.change_id);

  const [traced, question, note] = await Promise.all([
    db`SELECT t.program AS file, t.line_no, t.confidence, t.code FROM trace_lines t JOIN clauses c ON c.id = t.clause_id
       WHERE c.change_id = ${change_id} AND t.state = 'traced' ORDER BY t.confidence DESC, t.line_no LIMIT 1`,
    db`SELECT program AS file, line_start, line_end, question AS text FROM questions
       WHERE change_id = ${change_id} ORDER BY id LIMIT 1`,
    db`SELECT n.program AS file, n.line_start, n.line_end, n.text, n.author FROM notes n
       JOIN questions q ON q.id = n.question_id WHERE n.change_id = ${change_id} ORDER BY q.id LIMIT 1`,
  ]);

  const lines = d.diff.split('\n');
  const removed = lines.find((l) => l.startsWith('-') && !l.startsWith('---'));
  const added = lines.find((l) => l.startsWith('+') && !l.startsWith('+++'));
  const clean = (l: string) => l.slice(1).trim().replace(/\s+/g, ' ');
  const t = traced[0] as { file: string; line_no: number; confidence: string; code: string } | undefined;

  return {
    change_id,
    title: d.title,
    traced: t ? { ...t, confidence: Number(t.confidence), code: t.code.trim().replace(/\s+/g, ' ') } : null,
    question: (question[0] as RunSnapshot['question']) ?? null,
    note: (note[0] as RunSnapshot['note']) ?? null,
    diff: removed && added ? { removed: clean(removed), added: clean(added) } : null,
    approved_by: d.decided_by,
  };
}

/** The most recently approved change, the one "See a real run" should open. */
export async function getLatestApprovedChangeId(db: NeonQueryFunction<false, false> = defaultSql): Promise<number | null> {
  const rows = await db`SELECT change_id FROM drafts WHERE state = 'approved' ORDER BY decided_at DESC LIMIT 1`;
  return rows[0] ? Number((rows[0] as { change_id: number }).change_id) : null;
}

/** The run the landing page tells the story with: the one whose kept line an owner explained. */
export async function realRunHref(): Promise<string> {
  const proof = await getHeroProof().catch(() => null);
  const id = proof?.change_id ?? (await getLatestApprovedChangeId().catch(() => null));
  return id ? `/changes/${id}?tab=draft` : '/changes';
}

export type ReplayRow = {
  change_id: number;
  title: string;
  questions_asked: number;
  lines_known: number;
  lines_traced: number;
};

/** Approved changes in order, with the questions each asked and the lines it already knew from the memoir. */
export async function getReplay(db: NeonQueryFunction<false, false> = defaultSql): Promise<ReplayRow[]> {
  const rows = await db`
    SELECT c.id AS change_id, c.title,
      (SELECT count(*) FROM questions q WHERE q.change_id = c.id)::int AS questions_asked,
      (SELECT count(*) FROM trace_lines t JOIN clauses cl ON cl.id = t.clause_id
        WHERE cl.change_id = c.id AND t.state = 'known')::int AS lines_known,
      (SELECT count(DISTINCT (t.program, t.line_no)) FROM trace_lines t JOIN clauses cl ON cl.id = t.clause_id
        WHERE cl.change_id = c.id)::int AS lines_traced
    FROM changes c
    WHERE EXISTS (SELECT 1 FROM drafts d WHERE d.change_id = c.id AND d.state = 'approved')
    ORDER BY c.created_at
  `;
  return (rows as ReplayRow[]).map((r) => ({ ...r, change_id: Number(r.change_id) }));
}
