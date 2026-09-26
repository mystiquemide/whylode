'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CodeBlock, Eyebrow, PrimaryButton, StateTag, TextLink, type CodeLine } from '@/components/ui';

type Question = {
  id: number;
  program: string;
  line_start: number;
  line_end: number;
  excerpt: string;
  question: string;
  state: 'open' | 'answered' | 'reassigned';
  answer: string | null;
  lines: { no: number; text: string }[] | null;
};

type Inbox = {
  expert: { id: number; name: string };
  change: { id: number; title: string } | null;
  questions: Question[];
};

type Load = { kind: 'loading' } | { kind: 'expired' } | { kind: 'error' } | { kind: 'ready'; data: Inbox };

function range(q: Question) {
  return q.line_start === q.line_end ? `line ${q.line_start}` : `lines ${q.line_start} to ${q.line_end}`;
}

function codeFor(q: Question, state: CodeLine['state']): CodeLine[] {
  if (q.lines && q.lines.length > 0) return q.lines.map((l) => ({ ...l, state }));
  return q.excerpt.split('\n').map((text, i) => ({ no: q.line_start + i, text, state }));
}

export function ExpertInbox({ token }: { token: string }) {
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<number | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [newName, setNewName] = useState('');
  const [sentTo, setSentTo] = useState<{ name: string; link: string } | null>(null);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch(`/api/ask/${token}`, { cache: 'no-store' });
      if (res.status === 404) return setLoad({ kind: 'expired' });
      if (!res.ok) return setLoad({ kind: 'error' });
      setLoad({ kind: 'ready', data: (await res.json()) as Inbox });
    } catch {
      setLoad({ kind: 'error' });
    }
  }, [token]);

  useEffect(() => {
    // fetchInbox only sets state after the network response resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInbox();
  }, [fetchInbox]);

  if (load.kind === 'loading') {
    return <Shell><p className="text-steel">Loading your questions.</p></Shell>;
  }
  if (load.kind === 'expired') {
    return (
      <Shell>
        <h1 className="display text-[32px] leading-[1.19]">This link doesn&apos;t work anymore.</h1>
        <p className="mt-4 text-steel">Ask the team that sent it for a new one.</p>
      </Shell>
    );
  }
  if (load.kind === 'error') {
    return (
      <Shell>
        <h1 className="display text-[32px] leading-[1.19]">Can&apos;t load your questions right now.</h1>
        <div className="mt-6"><TextLink onClick={() => { setLoad({ kind: 'loading' }); fetchInbox(); }}>Try again</TextLink></div>
      </Shell>
    );
  }

  const { questions, change } = load.data;
  const open = questions.filter((q) => q.state === 'open');
  const current = open[0];
  const total = questions.length;
  const position = total - open.length + 1;

  async function save() {
    if (!current || !answer.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/ask/${token}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: current.id, answer: answer.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Could not save your answer.');
      setJustSaved(current.id);
      setAnswer('');
      await fetchInbox();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save your answer.');
    } finally {
      setSaving(false);
    }
  }

  async function reassign() {
    if (!current || !newName.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/ask/${token}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: current.id, new_expert_name: newName.trim() }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Could not send the question.');
      setSentTo({ name: newName.trim(), link: body.link });
      setNewName('');
      setReassigning(false);
      await fetchInbox();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not send the question.');
    } finally {
      setSaving(false);
    }
  }

  const answered = questions.filter((q) => q.state === 'answered');

  return (
    <Shell>
      <Eyebrow>Questions for you</Eyebrow>
      <h1 className="display mt-4 text-[40px] leading-[1.05] sm:text-[52px] sm:leading-[0.98]">
        The code doesn&apos;t explain these lines. <span className="text-brass underline decoration-1 underline-offset-[6px]">You</span> can.
      </h1>
      <p className="mt-5 max-w-xl text-[17px] leading-[1.5] text-steel">
        {change ? <>Bob is working on <span className="text-graphite">{change.title}</span> and </> : <>Bob </>}
        found {total} {total === 1 ? 'place' : 'places'} in the code that only you can explain. Your answers are saved
        next to the code, so nobody has to ask again.
      </p>

      {sentTo && (
        <div className="mt-8 rounded-panel bg-ivory p-5 text-[15px]">
          <p>Sent to {sentTo.name}. Share this link with them:</p>
          <p className="mt-2 break-all font-mono text-[13px] text-steel">{sentTo.link}</p>
        </div>
      )}

      {current ? (
        <section className="mt-12" aria-labelledby="q-heading">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] text-slate">Question {position} of {total}</p>
            <StateTag state="asked" />
          </div>
          <h2 id="q-heading" className="mt-2 font-mono text-[14px] text-steel">
            {current.program}, {range(current)}
          </h2>
          <p className="mt-3 text-[19px] leading-[1.45] sm:text-[20px]">{current.question}</p>
          <div className="mt-5">
            <CodeBlock lines={codeFor(current, 'asked')} label={current.program} />
          </div>

          {!reassigning ? (
            <>
              <label htmlFor="answer" className="mt-8 block text-[15px] font-medium">Your answer</label>
              <p id="answer-help" className="mt-1 text-[14px] text-slate">In your own words. A sentence or two is enough.</p>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-panel border border-mist bg-white p-4 text-[16px] leading-[1.5] outline-none focus:border-graphite"
                aria-describedby="answer-help"
              />
              {saveError && <p role="alert" className="mt-3 text-[15px] text-graphite"><span className="text-ember">Not saved.</span> {saveError}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-6">
                <PrimaryButton onClick={save} disabled={saving || !answer.trim()}>
                  {saving ? 'Saving' : 'Save answer'}
                </PrimaryButton>
                <TextLink onClick={() => { setReassigning(true); setSaveError(null); }}>I&apos;m not sure, send to someone else</TextLink>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-panel bg-ash p-5">
              <label htmlFor="name" className="block text-[15px] font-medium">Who knows this better?</label>
              <input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2 w-full rounded-panel border border-mist bg-white px-4 py-3 text-[16px] outline-none focus:border-graphite"
              />
              {saveError && <p role="alert" className="mt-3 text-[15px]"><span className="text-ember">Not sent.</span> {saveError}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-6">
                <PrimaryButton onClick={reassign} disabled={saving || !newName.trim()}>
                  {saving ? 'Sending' : 'Send'}
                </PrimaryButton>
                <TextLink onClick={() => setReassigning(false)}>Answer it myself</TextLink>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-12 rounded-panel bg-ivory p-6 sm:p-8">
          <h2 className="display text-[28px] leading-[1.2]">That&apos;s everything. Thank you.</h2>
          <p className="mt-3 text-steel">Your answers are now part of the memoir, pinned to the lines they explain.</p>
          <div className="mt-5"><TextLink href="/memoir">View the memoir</TextLink></div>
        </section>
      )}

      {answered.length > 0 && (
        <section className="mt-14" aria-labelledby="done-heading">
          <h2 id="done-heading" className="text-[15px] font-medium">Answered</h2>
          <ul className="mt-4 space-y-4">
            {answered.map((q) => (
              <li key={q.id} className={`line-state rounded-panel border-l-2 border-brass bg-white p-5 ${justSaved === q.id ? 'bg-ivory' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[13px] text-steel">{q.program}, {range(q)}</p>
                  <StateTag state="answered" />
                </div>
                <p className="mt-2 text-[15px] text-steel">{q.question}</p>
                {q.answer && <p className="mt-3 text-[16px] leading-[1.5]">&ldquo;{q.answer}&rdquo;</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto w-full max-w-[760px] px-4 pt-6 sm:px-6">
        <Link href="/" aria-label="Whylode home">
          <Image src="/brand/logo.svg" alt="Whylode" width={110} height={28} priority />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-20 pt-10 sm:px-6">{children}</main>
    </div>
  );
}
