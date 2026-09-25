import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';
import { insertEvent } from './events';

export async function recordTrace(
  clause_id: number,
  lines: Array<{
    program: string;
    line_no: number;
    code: string;
    confidence: number;
    known_note_id?: number;
  }>,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<number[]> {
  const ids: number[] = [];

  // Resolve change_id from clause for the event.
  const clauseRows = await db`SELECT change_id FROM clauses WHERE id = ${clause_id}`;
  const change_id = (clauseRows[0] as { change_id: number })?.change_id;
  if (!change_id) throw new Error(`Clause ${clause_id} not found`);

  for (const line of lines) {
    const state = line.known_note_id != null ? 'known' : 'traced';
    const note_id = line.known_note_id ?? null;
    const rows = await db`
      INSERT INTO trace_lines (clause_id, program, line_no, code, confidence, state, note_id)
      VALUES (${clause_id}, ${line.program}, ${line.line_no}, ${line.code}, ${line.confidence}, ${state}, ${note_id})
      RETURNING id
    `;
    ids.push((rows[0] as { id: number }).id);
  }

  await insertEvent(change_id, 'trace_recorded', { clause_id, line_count: lines.length }, db);

  return ids;
}

export async function getTraceLines(
  change_id: number,
  db: NeonQueryFunction<false, false> = defaultSql,
): Promise<Array<{
  id: number;
  clause_id: number;
  program: string;
  line_no: number;
  code: string;
  confidence: number;
  state: string;
  note_id: number | null;
}>> {
  const rows = await db`
    SELECT tl.id, tl.clause_id, tl.program, tl.line_no, tl.code, tl.confidence, tl.state, tl.note_id
    FROM trace_lines tl
    JOIN clauses cl ON cl.id = tl.clause_id
    WHERE cl.change_id = ${change_id}
    ORDER BY tl.clause_id, tl.line_no
  `;
  return rows as Array<{
    id: number; clause_id: number; program: string; line_no: number;
    code: string; confidence: number; state: string; note_id: number | null;
  }>;
}
