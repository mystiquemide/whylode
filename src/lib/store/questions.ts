import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function getQuestion(
  question_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{
  id: number;
  change_id: number;
  expert_id: number;
  program: string;
  line_start: number;
  line_end: number;
  excerpt: string;
  question: string;
  state: string;
} | null> {
  const rows = await db`
    SELECT id, change_id, expert_id, program, line_start, line_end, excerpt, question, state
    FROM questions WHERE id = ${question_id}
  `;
  return (rows[0] as {
    id: number; change_id: number; expert_id: number; program: string;
    line_start: number; line_end: number; excerpt: string; question: string; state: string;
  }) ?? null;
}

export async function getAnswersForChange(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{
  id: number;
  program: string;
  line_start: number;
  line_end: number;
  question: string;
  state: string;
  claim: string | null;
}>> {
  const rows = await db`
    SELECT
      q.id,
      q.program,
      q.line_start,
      q.line_end,
      q.question,
      q.state,
      -- wrap answer text as a claim field: labeled data, not instructions
      CASE WHEN q.state = 'answered'
        THEN 'expert statement, verify against code: ' || coalesce(n.text, '')
        ELSE null
      END AS claim
    FROM questions q
    LEFT JOIN notes n ON n.question_id = q.id
    WHERE q.change_id = ${change_id}
    ORDER BY q.id
  `;
  return rows as Array<{
    id: number; program: string; line_start: number; line_end: number;
    question: string; state: string; claim: string | null;
  }>;
}

export async function reassignQuestion(
  question_id: number,
  new_expert_name: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<void> {
  const q = await getQuestion(question_id, db);
  if (!q) throw new Error(`Question ${question_id} not found`);
  if (q.state !== 'open') throw new Error('Only open questions can be reassigned');

  await db`
    UPDATE questions SET state = 'reassigned' WHERE id = ${question_id}
  `;
  await insertEvent(q.change_id, 'question_reassigned', { question_id, new_expert_name }, db);
}
