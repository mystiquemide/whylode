'use server';

import { redirect } from 'next/navigation';
import { approverName, endApproverSession, isApprover, keyMatches, startApproverSession } from '@/lib/approver';
import { decideDraft } from '@/lib/store/drafts';
import { getOpenConflicts, reviewConflict } from '@/lib/store/conflicts';

function back(changeId: number, notice?: string): never {
  redirect(`/changes/${changeId}?tab=draft${notice ? `&notice=${notice}` : ''}`);
}

export async function signInAction(changeId: number, form: FormData) {
  const name = String(form.get('name') ?? '').trim().slice(0, 80);
  const key = String(form.get('key') ?? '').trim();
  if (!name || !keyMatches(key)) back(changeId, 'signin-failed');
  await startApproverSession(name);
  back(changeId);
}

export async function signOutAction(changeId: number) {
  await endApproverSession();
  back(changeId);
}

export async function decideAction(changeId: number, decision: 'approved' | 'changes_requested') {
  if (!(await isApprover())) back(changeId, 'not-approver');
  const name = (await approverName()) ?? 'Approver';
  let notice: string | undefined;
  try {
    await decideDraft(changeId, decision, name);
  } catch {
    notice = 'decision-refused';
  }
  back(changeId, notice);
}

export async function reviewConflictAction(changeId: number, conflictId: number) {
  if (!(await isApprover())) back(changeId, 'not-approver');
  const open = await getOpenConflicts(changeId);
  if (!open.some((c) => Number(c.id) === conflictId)) back(changeId, 'decision-refused');
  await reviewConflict(conflictId);
  back(changeId);
}
