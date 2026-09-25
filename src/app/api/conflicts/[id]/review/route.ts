import { reviewConflict } from '@/lib/store/conflicts';
import { NextRequest, NextResponse } from 'next/server';

function adminOk(req: NextRequest): boolean {
  const key = process.env.WHYLODE_ADMIN_KEY;
  if (!key) return false;
  const bearer = req.headers.get('authorization') ?? '';
  if (bearer === `Bearer ${key}`) return true;
  return (req.headers.get('x-admin-key') ?? '') === key;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!adminOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const conflict_id = Number(id);
  if (!Number.isInteger(conflict_id) || conflict_id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await reviewConflict(conflict_id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 404 },
    );
  }
}
