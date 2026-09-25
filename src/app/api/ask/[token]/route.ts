import { getExpertByToken, getExpertQuestions } from '@/lib/store/experts';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expert = await getExpertByToken(token);
  if (!expert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const questions = await getExpertQuestions(expert.id);
  return NextResponse.json({ expert: { id: expert.id, name: expert.name }, questions });
}
