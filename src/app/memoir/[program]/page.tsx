import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer, Nav } from '@/components/site';
import { CodeBlock, Eyebrow, StateTag, TextLink, type CodeLine } from '@/components/ui';
import { getProgramByName } from '@/lib/store/programs';
import { getMemoirNotes } from '@/lib/store/notes';

export const dynamic = 'force-dynamic';

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export async function generateMetadata({ params }: { params: Promise<{ program: string }> }): Promise<Metadata> {
  const { program } = await params;
  return { title: `${decodeURIComponent(program)} | Whylode memoir` };
}

export default async function ProgramMemoirPage({ params }: { params: Promise<{ program: string }> }) {
  const name = decodeURIComponent((await params).program);
  const program = await getProgramByName(name);
  if (!program) notFound();
  const notes = await getMemoirNotes(name);

  const noted = new Set<number>();
  for (const n of notes) for (let l = n.line_start; l <= n.line_end; l++) noted.add(l);
  const code: CodeLine[] = program.source
    .replace(/\n$/, '')
    .split('\n')
    .map((text, i) => ({ no: i + 1, text, state: noted.has(i + 1) ? 'answered' : null }));

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 sm:px-6">
        <Link href="/memoir" className="text-[14px] text-steel hover:text-graphite">
          <span aria-hidden>&lsaquo;</span> Memoir
        </Link>
        <div className="mt-8">
          <Eyebrow>Program</Eyebrow>
          <h1 className="mt-4 font-mono text-[28px] sm:text-[36px]">{program.name}</h1>
          <p className="mt-3 text-[14px] text-slate">
            {notes.length === 0 ? 'No notes on this program yet.' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. Lines with a note are marked in brass.`}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <CodeBlock lines={code} label={program.name} />
          <aside aria-label="Notes" className="space-y-4 lg:sticky lg:top-6">
            {notes.map((n) => (
              <article key={n.id} className="rounded-panel border-l-2 border-brass bg-ivory p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[13px] text-steel">
                    {n.line_start === n.line_end ? `Line ${n.line_start}` : `Lines ${n.line_start} to ${n.line_end}`}
                  </p>
                  <StateTag state="answered" />
                </div>
                <p className="mt-3 text-[16px] leading-[1.5]">&ldquo;{n.text}&rdquo;</p>
                <p className="mt-3 text-[14px] text-brass">{n.author}, {formatDate(n.created_at)}</p>
                {n.change_id && n.change_title && (
                  <div className="mt-3 text-[14px]">
                    <TextLink href={`/changes/${n.change_id}?tab=questions`}>From {n.change_title}</TextLink>
                  </div>
                )}
                {n.reused_in.length > 0 && (
                  <div className="mt-2 space-y-1 text-[14px]">
                    {n.reused_in.map((c) => (
                      <div key={c.id}>
                        <TextLink href={`/changes/${c.id}`}>Used again in {c.title}</TextLink>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
