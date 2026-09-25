import { getChange, getClauses } from '@/lib/store/changes';
import { getTraceLines } from '@/lib/store/trace';
import { getDraft } from '@/lib/store/drafts';
import { getEvents } from '@/lib/store/events';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const change_id = Number(id);
  if (!Number.isInteger(change_id) || change_id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const change = await getChange(change_id);
  if (!change) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [clauses, traceLines, draft, events, questions] = await Promise.all([
    getClauses(change_id),
    getTraceLines(change_id),
    getDraft(change_id),
    getEvents(change_id),
    sql`
      SELECT
        q.id::int AS id,
        q.program,
        q.line_start::int AS line_start,
        q.line_end::int AS line_end,
        q.excerpt,
        q.question,
        q.state,
        q.created_at,
        q.answered_at,
        n.id::int AS note_id,
        n.text AS note_text
      FROM questions q
      LEFT JOIN notes n ON n.question_id = q.id
      WHERE q.change_id = ${change_id}
      ORDER BY q.id
    `,
  ]);

  return NextResponse.json({ change, clauses, traceLines, questions, draft, events });
}
