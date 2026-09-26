import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '@/components/site';
import { Eyebrow } from '@/components/ui';
import { listChangeSummaries, type ChangeSummary } from '@/lib/store/changes';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Rule changes | Whylode' };

const STATUS_LABEL: Record<string, string> = {
  open: 'Tracing',
  waiting: 'Waiting on the owner',
  ready: 'Ready for review',
  approved: 'Approved',
};

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function facts(c: ChangeSummary): string[] {
  const out: string[] = [];
  if (c.lines_changed) out.push(plural(c.lines_changed, 'line changed', 'lines changed'));
  if (c.lines_kept) out.push(plural(c.lines_kept, 'line kept', 'lines kept'));
  if (c.questions_asked) out.push(plural(c.questions_asked, 'question', 'questions'));
  if (c.questions_open) out.push(`${c.questions_open} open`);
  if (c.lines_reused) out.push(plural(c.lines_reused, 'line already known', 'lines already known'));
  return out;
}

export default async function ChangesPage() {
  const changes = await listChangeSummaries();
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 pt-6 sm:px-6">
        <Eyebrow>Rule changes</Eyebrow>
        <h1 className="display mt-4 text-[40px] leading-[1.1] sm:text-[52px] sm:leading-[1.0]">Every change Whylode has handled.</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-[1.5] text-steel">
          Each one started as a notice, ran through IBM Bob, and ended with a person&apos;s decision.
        </p>

        {changes.length === 0 ? (
          <div className="mt-12 rounded-panel bg-white p-6 sm:p-8">
            <h2 className="display text-[24px]">No changes yet.</h2>
            <p className="mt-3 text-steel">Run the Whylode mode in IBM Bob on a change notice and it appears here.</p>
          </div>
        ) : (
          <ul className="mt-12 divide-y divide-mist rounded-panel bg-white">
            {changes.map((c) => (
              <li key={c.id}>
                <Link href={`/changes/${c.id}`} className="grid gap-2 p-6 hover:bg-page sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:p-8">
                  <div>
                    <p className="display text-[22px] leading-[1.3] sm:text-[24px]">{c.title}</p>
                    <p className="mt-2 text-[14px] text-steel">{facts(c).join('  ·  ') || 'Traced, no questions yet'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[14px] sm:justify-end">
                    <span className={c.status === 'approved' ? 'text-brass' : 'text-graphite'}>{STATUS_LABEL[c.status] ?? c.status}</span>
                    <span className="text-slate">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                    <span aria-hidden className="text-slate">&rsaquo;</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
