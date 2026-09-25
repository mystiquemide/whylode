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
