import { decideDraft } from '@/lib/store/drafts';
import { NextRequest, NextResponse } from 'next/server';

function adminOk(req: NextRequest): boolean {
  const key = process.env.WHYLODE_ADMIN_KEY;
  if (!key) return false;
  // Key arrives as a Bearer token or as X-Admin-Key header.
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
  const change_id = Number(id);
  if (!Number.isInteger(change_id) || change_id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({})) as { decision?: string; decided_by?: string };
  const decision = body.decision;
  const decided_by = body.decided_by ?? 'approver';

  if (decision !== 'approved' && decision !== 'changes_requested') {
    return NextResponse.json(
      { error: 'decision must be "approved" or "changes_requested"' },
      { status: 400 },
    );
  }

  try {
    const { draft_id } = await decideDraft(change_id, decision, decided_by);
    return NextResponse.json({ ok: true, draft_id, decision });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Decision failed' }, { status: 409 });
  }
}
