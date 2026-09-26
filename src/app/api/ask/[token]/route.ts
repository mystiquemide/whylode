import { getExpertByToken, getExpertQuestions } from '@/lib/store/experts';
import { getChange } from '@/lib/store/changes';
import { getProgramByName } from '@/lib/store/programs';
import { NextRequest, NextResponse } from 'next/server';

// Lines of real source shown around each question, with true line numbers.
function sourceLines(source: string, start: number, end: number) {
  const all = source.split('\n');
  const from = Math.max(1, start);
  const to = Math.min(all.length, end);
  return all.slice(from - 1, to).map((text, i) => ({ no: from + i, text }));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expert = await getExpertByToken(token);
  if (!expert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [change, questions] = await Promise.all([
    getChange(expert.change_id),
    getExpertQuestions(expert.id),
  ]);

  const programs = new Map<string, string | null>();
  for (const q of questions) {
    if (!programs.has(q.program)) {
      programs.set(q.program, (await getProgramByName(q.program))?.source ?? null);
    }
  }

  return NextResponse.json({
    expert: { id: expert.id, name: expert.name },
    change: change ? { id: change.id, title: change.title } : null,
    questions: questions.map((q) => {
      const source = programs.get(q.program);
      return {
        ...q,
        lines: source ? sourceLines(source, q.line_start, q.line_end) : null,
      };
    }),
  });
}
