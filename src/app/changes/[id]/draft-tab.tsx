import { approverName, isApprover } from '@/lib/approver';
import { getDraft, type DraftReason } from '@/lib/store/drafts';
import { getOpenConflicts } from '@/lib/store/conflicts';
import { Eyebrow, PrimaryButton, StateTag } from '@/components/ui';
import { decideAction, reviewConflictAction, signInAction, signOutAction } from './actions';

const NOTICES: Record<string, string> = {
  'signin-failed': 'That name and key did not match. Check the approver key and try again.',
  'not-approver': 'Sign in as the approver first.',
  'decision-refused': 'That decision could not be applied. The draft may already be decided, or a conflict is open.',
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export async function DraftTab({
  changeId,
  openQuestions,
  notice,
}: {
  changeId: number;
  openQuestions: number;
  notice?: string;
}) {
  const [draft, conflicts, approver, name] = await Promise.all([
    getDraft(changeId),
    getOpenConflicts(changeId),
    isApprover(),
    approverName(),
  ]);

  const noticeText = notice ? NOTICES[notice] : undefined;

  return (
    <div className="space-y-12">
      {noticeText && (
        <p role="alert" className="rounded-panel bg-ash p-4 text-[15px]">
          <span className="text-ember">Not done.</span> {noticeText}
        </p>
      )}

      {conflicts.length > 0 && (
        <section aria-labelledby="conflicts" className="space-y-4">
          <h2 id="conflicts" className="display text-[24px]">Conflicts to review</h2>
          {conflicts.map((c) => (
            <div key={c.id} className="rounded-panel border-l-2 border-ember bg-graphite p-6 text-white">
              <p className="text-[13px] text-white/60">The owner said</p>
              <p className="mt-1 text-[17px] leading-[1.5]">&ldquo;{c.claim}&rdquo;</p>
              <p className="mt-4 text-[13px] text-white/60">The code shows</p>
              <p className="mt-1 text-[17px] leading-[1.5]">{c.code_fact}</p>
              {approver && (
                <form action={reviewConflictAction.bind(null, changeId, Number(c.id))} className="mt-5">
                  <button className="rounded-pill bg-white px-5 py-2.5 text-[15px] font-medium text-graphite">Mark reviewed</button>
                </form>
              )}
            </div>
          ))}
        </section>
      )}

      {!draft ? (
        <section className="rounded-panel bg-white p-6 sm:p-8">
          <h2 className="display text-[24px]">
            {openQuestions > 0 ? 'The draft opens when every question is answered.' : 'Bob hasn’t submitted a draft yet.'}
          </h2>
          <p className="mt-3 text-steel">
            {openQuestions > 0
              ? `${openQuestions} ${openQuestions === 1 ? 'question is' : 'questions are'} still waiting on the owner.`
              : 'When Bob finishes checking the answers against the code, the proposed change appears here.'}
          </p>
        </section>
      ) : (
        <>
          <section aria-labelledby="diff">
            <Eyebrow>Proposed change</Eyebrow>
            <h2 id="diff" className="display mt-3 text-[28px] leading-[1.2]">What Bob wants to change</h2>
            <DiffBlock diff={draft.diff} />
          </section>

          <section aria-labelledby="reasons">
            <h2 id="reasons" className="display text-[28px] leading-[1.2]">Why each line</h2>
            <ul className="mt-6 space-y-4">
              {draft.reasons.map((r) => (
                <ReasonRow key={`${r.file}:${r.line_no}:${r.action}`} reason={r} />
              ))}
            </ul>
          </section>

          <Decision
            changeId={changeId}
            state={draft.state}
            decidedBy={draft.decided_by}
            decidedAt={draft.decided_at}
            approver={approver}
            name={name}
            blocked={conflicts.length > 0}
          />
        </>
      )}
    </div>
  );
}

function ReasonRow({ reason: r }: { reason: DraftReason }) {
  const kept = r.action === 'kept';
  return (
    <li className={`rounded-panel p-5 sm:p-6 ${kept ? 'border-l-2 border-brass bg-ivory' : 'border-l-2 border-graphite bg-white'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <StateTag state={kept ? 'kept' : 'changed'} />
        <span className="font-mono text-[13px] text-steel">{r.file}, line {r.line_no}</span>
      </div>
      {r.note_text && (
        <p className="mt-3 text-[17px] leading-[1.5]">
          <span className="text-steel">{kept ? 'Kept because the owner said: ' : 'Confirmed by the owner: '}</span>
          &ldquo;{r.note_text}&rdquo;
        </p>
      )}
      {r.clause_text && (
        <p className="mt-3 text-[15px] leading-[1.5] text-steel">
          <span className="text-brass">Clause.</span> {r.clause_text}
        </p>
      )}
    </li>
  );
}

function DiffBlock({ diff }: { diff: string }) {
  const rows = diff.replace(/\n$/, '').split('\n');
  return (
    <figure className="mt-6 overflow-hidden rounded-panel bg-white">
      <pre className="overflow-x-auto py-2 font-mono text-[12px] leading-6 sm:text-[14px]">
        {rows.map((line, i) => {
          const meta = line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@');
          const add = !meta && line.startsWith('+');
          const del = !meta && line.startsWith('-');
          const cls = meta
            ? 'text-slate'
            : add
              ? 'border-l-2 border-brass bg-ivory'
              : del
                ? 'border-l-2 border-graphite text-slate line-through decoration-slate/60'
                : 'border-l-2 border-transparent';
          return (
            <div key={i} className={`min-w-max px-4 whitespace-pre ${cls}`}>
              {line || ' '}
            </div>
          );
        })}
      </pre>
    </figure>
  );
}

function Decision({
  changeId,
  state,
  decidedBy,
  decidedAt,
  approver,
  name,
  blocked,
}: {
  changeId: number;
  state: string;
  decidedBy: string | null;
  decidedAt: string | null;
  approver: boolean;
  name: string | null;
  blocked: boolean;
}) {
  if (state === 'approved' || state === 'changes_requested') {
    return (
      <section className="rounded-panel bg-ivory p-6 sm:p-8">
        <h2 className="display text-[28px] leading-[1.2]">
          {state === 'approved' ? 'Approved' : 'Changes requested'}
        </h2>
        <p className="mt-2 text-[15px] text-brass">
          {decidedBy ?? 'Approver'}{decidedAt ? `, ${formatDate(decidedAt)}` : ''}
        </p>
      </section>
    );
  }

  if (!approver) {
    return (
      <section aria-labelledby="signin" className="rounded-panel bg-ash p-6 sm:p-8">
        <h2 id="signin" className="display text-[24px] leading-[1.25]">Sign in as approver to decide</h2>
        <p className="mt-2 text-[15px] text-steel">Anyone can read this change. Only the approver can approve it.</p>
        <form action={signInAction.bind(null, changeId)} className="mt-6 grid max-w-md gap-4">
          <label className="grid gap-1.5 text-[15px] font-medium">
            Your name
            <input name="name" required maxLength={80} autoComplete="name" className="rounded-panel border border-mist bg-white px-4 py-3 text-[16px] font-normal outline-none focus:border-graphite" />
          </label>
          <label className="grid gap-1.5 text-[15px] font-medium">
            Approver key
            <input name="key" type="password" required autoComplete="current-password" className="rounded-panel border border-mist bg-white px-4 py-3 text-[16px] font-normal outline-none focus:border-graphite" />
          </label>
          <div><PrimaryButton type="submit">Sign in</PrimaryButton></div>
        </form>
      </section>
    );
  }

  return (
    <section aria-labelledby="decide" className="rounded-panel bg-ash p-6 sm:p-8">
      <h2 id="decide" className="display text-[24px] leading-[1.25]">Your decision</h2>
      <p className="mt-2 text-[15px] text-steel">
        Signed in as {name ?? 'approver'}.{' '}
        {blocked ? 'Review the conflict above before deciding.' : 'Every changed and kept line has its reason above.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <form action={decideAction.bind(null, changeId, 'approved')}>
          <PrimaryButton type="submit" disabled={blocked}>Approve change</PrimaryButton>
        </form>
        <form action={decideAction.bind(null, changeId, 'changes_requested')}>
          <button type="submit" disabled={blocked} className="inline-flex items-center gap-1 text-[15px] font-medium underline decoration-ember decoration-1 underline-offset-[5px] disabled:opacity-50">
            Request changes <span aria-hidden>&rsaquo;</span>
          </button>
        </form>
        <form action={signOutAction.bind(null, changeId)} className="ml-auto">
          <TextLinkButton>Sign out</TextLinkButton>
        </form>
      </div>
    </section>
  );
}

function TextLinkButton({ children }: { children: React.ReactNode }) {
  return (
    <button type="submit" className="text-[14px] text-steel hover:text-graphite">
      {children}
    </button>
  );
}

