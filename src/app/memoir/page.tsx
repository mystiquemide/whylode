import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '@/components/site';
import { Eyebrow } from '@/components/ui';
import { listPrograms } from '@/lib/store/programs';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Memoir | Whylode' };

export default async function MemoirPage() {
  const programs = await listPrograms();
  const withNotes = programs.filter((p) => p.note_count > 0);
  const totalNotes = withNotes.reduce((n, p) => n + p.note_count, 0);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 pt-6 sm:px-6">
        <Eyebrow>Memoir</Eyebrow>
        <h1 className="display mt-4 max-w-4xl text-[40px] leading-[1.1] sm:text-[52px] sm:leading-[1.0]">
          What the code does, and <span className="text-brass underline decoration-1 underline-offset-[6px]">why</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-[1.5] text-steel">
          In the words of the people who built it, pinned to the lines they explain.
        </p>

        {withNotes.length === 0 ? (
          <div className="mt-12 rounded-panel bg-white p-6 sm:p-8">
            <h2 className="display text-[24px]">Nothing kept yet.</h2>
            <p className="mt-3 text-steel">The first answers land here after a rule change runs through Whylode.</p>
          </div>
        ) : (
          <>
            <p className="mt-10 text-[14px] text-slate">
              {totalNotes} {totalNotes === 1 ? 'note' : 'notes'} across {withNotes.length} {withNotes.length === 1 ? 'program' : 'programs'}
            </p>
            <ul className="mt-4 divide-y divide-mist rounded-panel bg-white">
              {programs.map((p) => (
                <li key={p.id}>
                  <Link href={`/memoir/${encodeURIComponent(p.name)}`} className="flex flex-wrap items-center justify-between gap-3 p-6 hover:bg-page sm:px-8">
                    <span className="font-mono text-[16px]">{p.name}</span>
                    <span className="flex items-center gap-4 text-[14px]">
                      <span className={p.note_count > 0 ? 'text-brass' : 'text-slate'}>
                        {p.note_count > 0 ? `${p.note_count} ${p.note_count === 1 ? 'note' : 'notes'}` : 'No notes yet'}
                      </span>
                      <span aria-hidden className="text-slate">&rsaquo;</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
