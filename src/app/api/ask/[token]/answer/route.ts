import { getExpertByToken } from '@/lib/store/experts';
import { answerQuestion } from '@/lib/store/notes';
import { getQuestionForExpert } from '@/lib/store/questions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expert = await getExpertByToken(token);
  if (!expert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { question_id?: unknown; answer?: unknown };
  const question_id = Number(body.question_id);
  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';

  if (!Number.isInteger(question_id) || question_id <= 0) {
    return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
  }
  if (!answer) {
    return NextResponse.json({ error: 'answer is required' }, { status: 400 });
  }

  // A token may only answer its own expert's questions.
  const q = await getQuestionForExpert(question_id, expert.id);
  if (!q) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  try {
    const { note_id } = await answerQuestion(question_id, answer, expert.name);
    return NextResponse.json({ ok: true, note_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save answer' },
      { status: 409 },
    );
  }
}
