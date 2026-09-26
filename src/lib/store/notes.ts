import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function answerQuestion(
  question_id: number,
  answer_text: string,
  author: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ note_id: number }> {
  // Load question for line range and change_id.
  const qRows = await db`
    SELECT id, change_id, program, line_start, line_end, state FROM questions WHERE id = ${question_id}
  `;
  const q = qRows[0] as {
    id: number; change_id: number; program: string;
    line_start: number; line_end: number; state: string;
  } | undefined;
  if (!q) throw new Error(`Question ${question_id} not found`);
  if (q.state !== 'open') throw new Error('This question has already been answered or reassigned');

  // Enforce one-note rule via the UNIQUE(question_id) constraint.
  // If a note already exists the INSERT will throw a unique-violation.
  const noteRows = await db`
    INSERT INTO notes (program, line_start, line_end, text, author, question_id, change_id)
    VALUES (${q.program}, ${q.line_start}, ${q.line_end}, ${answer_text}, ${author}, ${question_id}, ${q.change_id})
    RETURNING id::int AS id
  `;
  const note_id = (noteRows[0] as { id: number }).id;

  await db`
    UPDATE questions SET state = 'answered', answered_at = now() WHERE id = ${question_id}
  `;

  await db`
    UPDATE trace_lines SET state = 'answered', note_id = ${note_id}
    WHERE state IN ('traced', 'asked') AND program = ${q.program}
      AND line_no BETWEEN ${q.line_start} AND ${q.line_end}
      AND clause_id IN (SELECT id FROM clauses WHERE change_id = ${q.change_id})
  `;

  await insertEvent(q.change_id, 'question_answered', { question_id, note_id }, db);

  return { note_id };
}

export async function getNotesByProgram(
  program: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; line_start: number; line_end: number; text: string; author: string; created_at: Date }>> {
  const rows = await db`
    SELECT id, line_start, line_end, text, author, created_at
    FROM notes
    WHERE program = ${program}
    ORDER BY line_start
  `;
  return rows as Array<{ id: number; line_start: number; line_end: number; text: string; author: string; created_at: Date }>;
}

export async function memoirLookup(
  program: string,
  line_start: number,
  line_end: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{ id: number; line_start: number; line_end: number; text: string; author: string }>> {
  const rows = await db`
    SELECT id, line_start, line_end, text, author
    FROM notes
    WHERE program = ${program}
      AND line_start <= ${line_end}
      AND line_end   >= ${line_start}
    ORDER BY line_start
  `;
  return rows as Array<{ id: number; line_start: number; line_end: number; text: string; author: string }>;
}

export type MemoirNote = {
  id: number;
  line_start: number;
  line_end: number;
  text: string;
  author: string;
  created_at: string;
  change_id: number | null;
  change_title: string | null;
  reused_in: { id: number; title: string }[];
};

/** Notes for one program, each with the change it came from and any later change that reused it. */
export async function getMemoirNotes(
  program: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<MemoirNote[]> {
  const rows = await db`
    SELECT n.id, n.line_start, n.line_end, n.text, n.author, n.created_at,
           n.change_id, c.title AS change_title,
           COALESCE((
             SELECT json_agg(DISTINCT jsonb_build_object('id', c2.id, 'title', c2.title))
             FROM trace_lines t
             JOIN clauses cl ON cl.id = t.clause_id
             JOIN changes c2 ON c2.id = cl.change_id
             WHERE t.note_id = n.id AND t.state = 'known' AND c2.id <> n.change_id
           ), '[]') AS reused_in
    FROM notes n
    LEFT JOIN changes c ON c.id = n.change_id
    WHERE n.program = ${program}
    ORDER BY n.line_start, n.id
  `;
  return rows as MemoirNote[];
}
