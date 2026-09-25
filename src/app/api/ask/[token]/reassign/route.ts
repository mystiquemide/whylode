import { getExpertByToken } from '@/lib/store/experts';
import { reassignQuestion } from '@/lib/store/questions';
import { createExpert } from '@/lib/store/experts';
import { getQuestion } from '@/lib/store/questions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expert = await getExpertByToken(token);
  if (!expert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as {
    question_id?: unknown;
    new_expert_name?: unknown;
  };

  const question_id = Number(body.question_id);
  const new_expert_name = typeof body.new_expert_name === 'string' ? body.new_expert_name.trim() : '';

  if (!Number.isInteger(question_id) || question_id <= 0) {
    return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
  }
  if (!new_expert_name) {
    return NextResponse.json({ error: 'new_expert_name is required' }, { status: 400 });
  }

  // Verify the question belongs to this expert's change.
  const q = await getQuestion(question_id);
  if (!q || q.change_id !== expert.change_id) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  try {
    await reassignQuestion(question_id, new_expert_name);

    // Create a new expert with the same question forwarded.
    const { token: newToken } = await createExpert(expert.change_id, new_expert_name, [
      {
        program: q.program,
        line_start: q.line_start,
        line_end: q.line_end,
        excerpt: q.excerpt,
        question: q.question,
      },
    ]);

    const base = process.env.WHYLODE_BASE_URL ?? 'http://localhost:3000';
    return NextResponse.json({ ok: true, link: `${base}/ask/${newToken}` });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to reassign' },
      { status: 409 },
    );
  }
}
