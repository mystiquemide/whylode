import { getProgramByName } from '@/lib/store/programs';
import { getNotesByProgram } from '@/lib/store/notes';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ program: string }> },
) {
  const { program } = await params;
  const name = decodeURIComponent(program);

  const prog = await getProgramByName(name);
  if (!prog) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const notes = await getNotesByProgram(name);
  return NextResponse.json({ program: prog, notes });
}
