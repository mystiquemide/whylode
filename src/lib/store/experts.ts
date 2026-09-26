import { NeonQueryFunction } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function createExpert(
  change_id: number,
  name: string,
  questions: Array<{
    program: string;
    line_start: number;
    line_end: number;
    excerpt: string;
    question: string;
  }>,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ expert_id: number; token: string; question_ids: number[] }> {
  const token = generateToken();

  const expertRows = await db`
    INSERT INTO experts (change_id, name, token) VALUES (${change_id}, ${name}, ${token}) RETURNING id::int AS id
  `;
  const expert_id = (expertRows[0] as { id: number }).id;

  const question_ids: number[] = [];
  for (const q of questions) {
    const rows = await db`
      INSERT INTO questions (change_id, expert_id, program, line_start, line_end, excerpt, question)
      VALUES (${change_id}, ${expert_id}, ${q.program}, ${q.line_start}, ${q.line_end}, ${q.excerpt}, ${q.question})
      RETURNING id::int AS id
    `;
    question_ids.push((rows[0] as { id: number }).id);
    await db`
      UPDATE trace_lines SET state = 'asked'
      WHERE state = 'traced' AND program = ${q.program}
        AND line_no BETWEEN ${q.line_start} AND ${q.line_end}
        AND clause_id IN (SELECT id FROM clauses WHERE change_id = ${change_id})
    `;
  }

  await insertEvent(change_id, 'expert_asked', { expert_id, expert_name: name, question_count: questions.length }, db);

  return { expert_id, token, question_ids };
}

export async function getExpertByToken(
  token: string,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<{ id: number; change_id: number; name: string } | null> {
  const rows = await db`
    SELECT id, change_id, name FROM experts WHERE token = ${token}
  `;
  return (rows[0] as { id: number; change_id: number; name: string }) ?? null;
}

export async function getExpertQuestions(
  expert_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{
  id: number;
  program: string;
  line_start: number;
  line_end: number;
  excerpt: string;
  question: string;
  state: string;
  answer: string | null;
}>> {
  const rows = await db`
    SELECT q.id, q.program, q.line_start, q.line_end, q.excerpt, q.question, q.state,
           n.text AS answer
    FROM questions q
    LEFT JOIN notes n ON n.question_id = q.id
    WHERE q.expert_id = ${expert_id}
    ORDER BY q.id
  `;
  return rows as Array<{
    id: number; program: string; line_start: number; line_end: number;
    excerpt: string; question: string; state: string; answer: string | null;
  }>;
}
