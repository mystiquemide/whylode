import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer, Nav } from '@/components/site';
import { CodeBlock, Eyebrow, StateTag, type CodeLine, type LineState } from '@/components/ui';
import { getChange, getClauses } from '@/lib/store/changes';
import { getTraceLines } from '@/lib/store/trace';
import { getProgramByName } from '@/lib/store/programs';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  open: 'Tracing',
  waiting: 'Waiting on the owner',
  ready: 'Draft ready for review',
  approved: 'Approved',
};

type Tab = 'trace';
const TABS: { key: Tab; label: string }[] = [{ key: 'trace', label: 'Trace' }];

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const change = Number.isInteger(Number(id)) ? await getChange(Number(id)).catch(() => null) : null;
  return { title: change ? `${change.title} | Whylode` : 'Change | Whylode' };
}

export default async function ChangePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const change_id = Number(id);
  if (!Number.isInteger(change_id) || change_id <= 0) notFound();

  const change = await getChange(change_id);
  if (!change) notFound();

  const tab: Tab = TABS.some((t) => t.key === tabParam) ? (tabParam as Tab) : 'trace';

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 sm:px-6">
        <Link href="/changes" className="text-[14px] text-steel hover:text-graphite">
          <span aria-hidden>&lsaquo;</span> All changes
        </Link>
        <div className="mt-8">
          <Eyebrow>Rule change</Eyebrow>
          <h1 className="display mt-4 max-w-4xl text-[32px] leading-[1.15] sm:text-[40px] sm:leading-[1.2]">{change.title}</h1>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-steel">
            <span className="font-mono text-[13px]">{change.source_file}</span>
            <span>Opened {formatDate(change.created_at)}</span>
            <span>
              Status: <span className="text-graphite">{STATUS_LABEL[change.status] ?? change.status}</span>
            </span>
          </p>
        </div>

        <nav aria-label="Change sections" className="mt-10 inline-flex rounded-pill bg-ash p-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/changes/${change_id}?tab=${t.key}`}
              aria-current={tab === t.key ? 'page' : undefined}
              className={`rounded-pill px-4 py-1.5 text-[15px] ${tab === t.key ? 'bg-white text-graphite' : 'text-steel hover:text-graphite'}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10">{tab === 'trace' && <TraceTab changeId={change_id} />}</div>
      </main>
      <Footer />
    </>
  );
}

async function TraceTab({ changeId }: { changeId: number }) {
  const [clauses, lines] = await Promise.all([getClauses(changeId), getTraceLines(changeId)]);

  if (lines.length === 0) {
    return <p className="text-steel">Bob hasn&apos;t traced any lines for this change yet.</p>;
  }

  const sources = new Map<string, string[]>();
  for (const program of new Set(lines.map((l) => l.program))) {
    const p = await getProgramByName(program);
    if (p) sources.set(program, p.source.split('\n'));
  }

  return (
    <div className="space-y-14">
      {clauses.map((clause, i) => {
        const clauseLines = lines.filter((l) => l.clause_id === clause.id);
        const byProgram = new Map<string, typeof clauseLines>();
        for (const l of clauseLines) byProgram.set(l.program, [...(byProgram.get(l.program) ?? []), l]);

        return (
          <section key={clause.id} aria-labelledby={`clause-${clause.id}`}>
            <p className="text-[13px] text-brass">Clause {i + 1}</p>
            <h2 id={`clause-${clause.id}`} className="display mt-2 max-w-3xl text-[22px] leading-[1.3] sm:text-[24px]">
              &ldquo;{clause.text}&rdquo;
            </h2>

            {clauseLines.length === 0 ? (
              <p className="mt-4 text-[15px] text-steel">No code lines implement this clause.</p>
            ) : (
              [...byProgram.entries()].map(([program, pLines]) => {
                const src = sources.get(program);
                const nums = pLines.map((l) => l.line_no);
                const from = Math.max(1, Math.min(...nums) - 1);
                const to = Math.max(...nums) + 1;
                const stateOf = new Map(pLines.map((l) => [l.line_no, l.state as LineState]));
                const code: CodeLine[] = src
                  ? src.slice(from - 1, Math.min(to, src.length)).map((text, k) => ({
                      no: from + k,
                      text,
                      state: stateOf.get(from + k) ?? null,
                    }))
                  : pLines.map((l) => ({ no: l.line_no, text: l.code, state: l.state as LineState }));

                return (
                  <div key={program} className="mt-6">
                    <CodeBlock lines={code} label={program} />
                    <ul className="mt-3 divide-y divide-mist">
                      {groupLines(pLines).map((g) => (
                        <li key={g.key} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-[14px]">
                          <span className="min-w-16 font-mono text-[13px] text-steel">{g.label}</span>
                          <StateTag state={g.state} />
                          <span className="text-slate">Bob&apos;s confidence {g.confidence.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </section>
        );
      })}
    </div>
  );
}

/** Merge lines that share a state and confidence into one row, with compact ranges. */
function groupLines(lines: { line_no: number; state: string; confidence: number | string }[]) {
  const groups = new Map<string, { state: LineState; confidence: number; nums: number[] }>();
  for (const l of [...lines].sort((a, b) => a.line_no - b.line_no)) {
    const confidence = Number(l.confidence);
    const key = `${l.state}:${confidence}`;
    const g = groups.get(key) ?? { state: l.state as LineState, confidence, nums: [] };
    g.nums.push(l.line_no);
    groups.set(key, g);
  }
  return [...groups.entries()].map(([key, g]) => {
    const ranges: string[] = [];
    let start = g.nums[0];
    let prev = start;
    for (const n of [...g.nums.slice(1), Infinity]) {
      if (n === prev + 1) { prev = n; continue; }
      ranges.push(start === prev ? `${start}` : `${start} to ${prev}`);
      start = prev = n;
    }
    const plural = g.nums.length > 1 ? 'Lines' : 'Line';
    return { key, state: g.state, confidence: g.confidence, label: `${plural} ${ranges.join(', ')}` };
  });
}
