import Image from 'next/image';
import Link from 'next/link';
import { Footer, Nav } from '@/components/site';
import { Eyebrow, PrimaryLink, StateTag, TextLink } from '@/components/ui';
import { CountUp, Reveal } from '@/components/motion';
import { getHeroProof, getReplay, getRunSnapshot, realRunHref, type HeroProof, type ReplayRow, type RunSnapshot } from '@/lib/store/landing';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const proof = await getHeroProof().catch(() => null);
  const [run, replay] = await Promise.all([
    proof ? getRunSnapshot(proof.change_id).catch(() => null) : Promise.resolve(null),
    getReplay().catch(() => [] as ReplayRow[]),
  ]);
  const runHref = proof ? `/changes/${proof.change_id}?tab=draft` : await realRunHref();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-16">
          <div>
            <div className="rise rise-1"><Eyebrow>For IBM i teams</Eyebrow></div>
            <h1 className="display mt-6 text-[44px] leading-[1.0] sm:text-[66px] sm:leading-[0.95]">
              <span className="rise rise-1 inline-block">The code survived.</span>{' '}
              <span className="rise rise-2 inline-block">The reason didn&apos;t.</span>{' '}
              <span className="rise rise-3 inline-block">
                Keep the <span className="draw text-brass underline decoration-1 underline-offset-[8px]">why</span>.
              </span>
            </h1>
            <p className="rise rise-4 mt-8 max-w-xl text-[18px] leading-[1.5] text-steel">
              Whylode runs inside IBM Bob. When a rule changes, it traces every line that has to change, asks the one
              person who knows why, and keeps the answer.
            </p>
            <div className="rise rise-5 mt-10 flex flex-wrap items-center gap-6">
              <PrimaryLink href={runHref}>See a real run</PrimaryLink>
              <TextLink href="/memoir">View the memoir</TextLink>
            </div>
          </div>

          <div className="rise rise-2 relative lg:pb-20">
            <Image
              src="/images/hero-expert.jpg"
              alt="An experienced developer working on a laptop"
              width={1200}
              height={675}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[4/3] w-full rounded-panel object-cover object-[70%_center] saturate-[0.85]"
            />
            {proof && (
              <figure className="mt-4 rounded-panel bg-white p-5 lg:absolute lg:bottom-0 lg:-left-10 lg:mt-0 lg:max-w-[380px]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[13px] text-steel">
                    {proof.file}, line {proof.line_no}
                  </p>
                  <span className="relative inline-grid">
                    <span className="tag-out col-start-1 row-start-1 opacity-0"><StateTag state="asked" /></span>
                    <span className="tag-in col-start-1 row-start-1"><StateTag state="kept" /></span>
                  </span>
                </div>
                <p className="settle mt-2 border-l-2 border-brass bg-ivory px-3 py-1.5 font-mono text-[13px]">{proof.code}</p>
                <blockquote className="mt-3 text-[15px] leading-[1.5]">&ldquo;{proof.note}&rdquo;</blockquote>
                <figcaption className="mt-2 text-[13px] text-brass">
                  {proof.author}, the system owner. From a recorded run.
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        <section aria-labelledby="problem" className="pb-20 lg:pb-28">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
            <Reveal className="relative -mr-4 rounded-tl-[8px] bg-ash sm:-mr-6 xl:mr-[calc((1200px-100vw)/2-24px)]">
              <div className="grid gap-12 px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[1fr_360px] lg:gap-16">
                <div>
                  <Eyebrow>The problem</Eyebrow>
                  <h2 id="problem" className="display mt-5 max-w-2xl text-[36px] leading-[1.1] sm:text-[48px] sm:leading-[1.05]">
                    Nothing breaks until the rule changes.
                  </h2>
                  <dl className="mt-12 max-w-2xl divide-y divide-mist border-y border-mist">
                    <div className="grid gap-2 py-6 sm:grid-cols-[120px_1fr] sm:gap-8">
                      <dt className="display text-[40px] leading-none text-brass">69%</dt>
                      <dd className="text-[17px] leading-[1.5] text-steel">
                        of IBM i shops name skills as a top concern, ahead of cybersecurity for the first time in nine
                        years.
                        <span className="mt-2 block text-[14px] text-slate">
                          Fortra, 2026 IBM i Marketplace Survey, 315 respondents.{' '}
                          <a
                            href="https://www.itjungle.com/2026/02/02/skills-displaces-cybersecurity-as-top-concern-for-ibm-i-shops/"
                            className="underline decoration-ember underline-offset-[3px] hover:text-graphite"
                          >
                            Source
                          </a>
                        </span>
                      </dd>
                    </div>
                    <div className="grid gap-2 py-6 sm:grid-cols-[120px_1fr] sm:gap-8">
                      <dt className="display text-[28px] leading-tight">Rules</dt>
                      <dd className="text-[17px] leading-[1.5] text-steel">
                        Tax rates, EDI formats, and month-end jobs keep changing. Every time, someone has to edit code that
                        nobody ever explained.
                      </dd>
                    </div>
                    <div className="grid gap-2 py-6 sm:grid-cols-[120px_1fr] sm:gap-8">
                      <dt className="display text-[28px] leading-tight">Why</dt>
                      <dd className="text-[17px] leading-[1.5] text-steel">
                        Documentation tools can say what the code does. Nobody wrote down why it does it, and the person who
                        knows is about to retire.
                      </dd>
                    </div>
                  </dl>
                </div>
                <Image
                  src="/images/warehouse-aisle.jpg"
                  alt="A warehouse aisle with a forklift between tall racks"
                  width={720}
                  height={1080}
                  sizes="(min-width: 1024px) 360px, 100vw"
                  className="aspect-[4/5] w-full rounded-panel object-cover saturate-[0.85] lg:aspect-[2/3]"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {run && <HowItWorks run={run} />}
        {run?.diff && proof && <Proof run={run} proof={proof} />}
        {replay.length >= 2 && <Replay rows={replay} />}
        <Keep />
        <BuiltOnBob />
        <FinalBand href={runHref} />
      </main>
      <Footer />
    </>
  );
}

function range(a: number, b: number) {
  return a === b ? `line ${a}` : `lines ${a} to ${b}`;
}

function Snippet({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 rounded-panel bg-white p-4 text-[14px] leading-[1.5]">{children}</div>;
}

function HowItWorks({ run }: { run: RunSnapshot }) {
  const steps = [
    {
      n: '01',
      name: 'Trace',
      text: 'Bob reads the change notice and finds every line that implements it, with a confidence score for each.',
      snippet: run.traced && (
        <>
          <p className="font-mono text-[12px] text-slate">{run.traced.file}, line {run.traced.line_no}</p>
          <p className="mt-1 border-l-2 border-graphite pl-2 font-mono text-[13px]">{run.traced.code}</p>
          <p className="mt-2 text-[13px] text-steel">Traced by Bob, confidence {run.traced.confidence.toFixed(2)}</p>
        </>
      ),
    },
    {
      n: '02',
      name: 'Ask',
      text: 'Where the code can\u2019t explain itself, Bob asks the person who knows. One plain question, on their phone.',
      snippet: run.question && (
        <>
          <p className="font-mono text-[12px] text-slate">{run.question.file}, {range(run.question.line_start, run.question.line_end)}</p>
          <p className="mt-1 border-l-2 border-ember pl-2">{run.question.text}</p>
        </>
      ),
    },
    {
      n: '03',
      name: 'Keep',
      text: 'The answer is pinned to the exact lines it explains, so the next change starts from what\u2019s already known.',
      snippet: run.note && (
        <>
          <p className="font-mono text-[12px] text-slate">{run.note.file}, {range(run.note.line_start, run.note.line_end)}</p>
          <p className="mt-1 border-l-2 border-brass bg-ivory px-2 py-1">&ldquo;{run.note.text}&rdquo;</p>
          <p className="mt-2 text-[13px] text-brass">{run.note.author}</p>
        </>
      ),
    },
    {
      n: '04',
      name: 'Change',
      text: 'Bob drafts the edit with a reason on every changed and kept line. A person approves it.',
      snippet: run.diff && (
        <>
          <p className="font-mono text-[13px] text-slate line-through">{run.diff.removed}</p>
          <p className="border-l-2 border-brass bg-ivory px-2 font-mono text-[13px]">{run.diff.added}</p>
          {run.approved_by && <p className="mt-2 text-[13px] text-brass">Approved by {run.approved_by}</p>}
        </>
      ),
    },
  ];

  return (
    <section id="how" aria-labelledby="how-heading" className="scroll-mt-8 pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <Reveal>
        <Eyebrow>How it works</Eyebrow>
        <h2 id="how-heading" className="display mt-5 max-w-3xl text-[36px] leading-[1.1] sm:text-[48px] sm:leading-[1.05]">
          Four steps, all inside IBM Bob.
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-[1.5] text-steel">
          Every example below comes from a real run: {run.title}.{' '}
          <Link href={`/changes/${run.change_id}`} className="text-graphite underline decoration-ember underline-offset-[3px]">
            Open the full record
          </Link>
          .
        </p>
        </Reveal>
        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 120} className="border-t border-graphite pt-5">
              <p className="font-mono text-[13px] text-brass">{s.n}</p>
              <h3 className="display mt-2 text-[28px] leading-tight">{s.name}</h3>
              <p className="mt-3 text-[15px] leading-[1.5] text-steel">{s.text}</p>
              {s.snippet && <Snippet>{s.snippet}</Snippet>}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Proof({ run, proof }: { run: RunSnapshot; proof: HeroProof }) {
  return (
    <section aria-labelledby="proof" className="pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <Reveal className="-mr-4 rounded-tl-[8px] bg-ash px-6 py-14 sm:-mr-6 sm:px-12 sm:py-20 xl:mr-[calc((1200px-100vw)/2-24px)]">
          <Eyebrow>The proof</Eyebrow>
          <h2 id="proof" className="display mt-5 max-w-3xl text-[36px] leading-[1.1] sm:text-[48px] sm:leading-[1.05]">
            The code had two rates. Only the owner knew which one was the{' '}
            <span className="text-brass underline decoration-1 underline-offset-[6px]">state&apos;s</span>.
          </h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-[1.5] text-steel">
            Nothing in {proof.file} says what the second rate is for. Bob didn&apos;t guess. It asked, and the approved
            change edits one line and leaves the other alone, with the owner&apos;s reason attached.
          </p>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <article className="rounded-panel border-l-2 border-graphite bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <StateTag state="changed" />
                <span className="font-mono text-[13px] text-steel">{proof.file}, the state rate</span>
              </div>
              <p className="mt-5 font-mono text-[14px] text-slate line-through">{run.diff!.removed}</p>
              <p className="mt-1 border-l-2 border-brass bg-ivory px-3 py-1 font-mono text-[14px]">{run.diff!.added}</p>
              <p className="mt-5 text-[15px] leading-[1.5] text-steel">Changed because the notice raises the state rate.</p>
            </article>
            <article className="rounded-panel border-l-2 border-brass bg-ivory p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <StateTag state="kept" />
                <span className="font-mono text-[13px] text-steel">
                  {proof.file}, line {proof.line_no}
                </span>
              </div>
              <p className="mt-5 font-mono text-[14px]">{proof.code}</p>
              <p className="mt-5 text-[17px] leading-[1.5]">
                <span className="text-steel">Kept because the owner said: </span>&ldquo;{proof.note}&rdquo;
              </p>
              <p className="mt-3 text-[14px] text-brass">{proof.author}</p>
            </article>
          </div>

          <div className="mt-8">
            <TextLink href={`/changes/${proof.change_id}?tab=draft`}>See the approved change</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Keep() {
  return (
    <section aria-labelledby="keep" className="pb-20 lg:pb-28">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal className="photo-zoom overflow-hidden rounded-panel">
        <Image
          src="/images/handover.jpg"
          alt="Two colleagues reviewing work together on a laptop"
          width={1200}
          height={675}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="aspect-[4/3] w-full rounded-panel object-cover saturate-[0.85]"
        />
        </Reveal>
        <Reveal delay={150}>
          <Eyebrow>The memoir</Eyebrow>
          <h2 id="keep" className="display mt-5 text-[36px] leading-[1.1] sm:text-[48px] sm:leading-[1.05]">
            Knowledge that outlives the handover.
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.5] text-steel">
            Every answer is kept in plain language, pinned to the exact lines it explains. The next developer reads it
            next to the code, and Bob checks it before asking the same question twice.
          </p>
          <div className="mt-8">
            <TextLink href="/memoir">Read the memoir</TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const BOB_FEATURES = [
  { name: 'Custom mode', text: 'Whylode runs as its own Bob mode, with its role and rules.' },
  { name: 'Skills', text: 'Trace, ask, and draft skills tell Bob exactly how to handle a change.' },
  { name: 'MCP tools', text: 'Eight tools connect Bob to the change record, the questions, and the memoir.' },
  { name: 'Document understanding', text: 'Bob reads the change notice PDF directly and splits it into clauses.' },
];

function BuiltOnBob() {
  const repo = 'https://github.com/mystiquemide/whylode';
  return (
    <section aria-labelledby="bob" className="pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <Reveal className="border-t border-graphite pt-10">
          <div className="flex flex-wrap items-center gap-3">
            <Image src="/partners/ibm-bob.svg" alt="" width={40} height={40} />
            <p className="text-[22px]">
              IBM <span className="font-semibold">Bob</span>
            </p>
          </div>
          <h2 id="bob" className="display mt-6 max-w-3xl text-[32px] leading-[1.15] sm:text-[40px]">
            Built on IBM Bob 2.0. Bob does the work, people keep the say.
          </h2>
          <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {BOB_FEATURES.map((f) => (
              <div key={f.name}>
                <dt className="text-[15px] font-medium">{f.name}</dt>
                <dd className="mt-1.5 text-[14px] leading-[1.5] text-steel">{f.text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[15px] text-steel">
            Every Bob task behind this project is in the repository.{' '}
            <a href={`${repo}/tree/main/bob_sessions`} className="text-graphite underline decoration-ember underline-offset-[3px]">
              Session reports
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FinalBand({ href }: { href: string }) {
  return (
    <section aria-labelledby="final" className="relative isolate overflow-hidden">
      <Image
        src="/images/warehouse-stock.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-center saturate-[0.85]"
      />
      <div className="absolute inset-0 -z-10 bg-graphite/60" />
      <Reveal className="mx-auto w-full max-w-[1200px] px-4 py-24 sm:px-6 lg:py-36">
        <h2 id="final" className="display max-w-3xl text-[40px] leading-[1.05] text-white sm:text-[56px] sm:leading-[1.0]">
          Someone at your company knows why. Ask them while you can.
        </h2>
        <div className="mt-10">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-pill bg-white px-5 py-2.5 text-[15px] font-medium text-graphite hover:bg-page"
          >
            See a real run
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Replay({ rows }: { rows: ReplayRow[] }) {
  const [first, ...later] = rows;
  const known = later.reduce((n, r) => n + r.lines_known, 0);
  return (
    <section aria-labelledby="replay" className="pb-20 lg:pb-28">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <Reveal>
        <Eyebrow>The next change</Eyebrow>
        <h2 id="replay" className="display mt-5 max-w-3xl text-[36px] leading-[1.1] sm:text-[48px] sm:leading-[1.05]">
          Nobody gets asked the same thing twice.
        </h2>
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.5] text-steel">
          The second change touched the same tax code. Bob found {known} {known === 1 ? 'line' : 'lines'} already explained
          in the memoir and only asked about what was new.
        </p>
        </Reveal>
        <ol className="mt-12 divide-y divide-mist border-y border-mist">
          {[first, ...later].map((r, i) => (
            <li key={r.change_id}>
              <Link
                href={`/changes/${r.change_id}`}
                className="grid gap-3 py-6 hover:bg-ash/60 sm:grid-cols-[80px_1fr_auto] sm:items-center sm:gap-8 sm:px-2"
              >
                <span className="font-mono text-[13px] text-brass">Change {i + 1}</span>
                <span className="display text-[22px] leading-[1.3] sm:text-[24px]">{r.title}</span>
                <span className="flex flex-wrap gap-x-8 gap-y-1 text-[15px]">
                  <span>
                    <CountUp value={r.questions_asked} className="display text-[28px] leading-none" />{' '}
                    <span className="text-steel">{r.questions_asked === 1 ? 'question' : 'questions'}</span>
                  </span>
                  <span>
                    <CountUp
                      value={r.lines_known}
                      className={`display text-[28px] leading-none ${r.lines_known > 0 ? 'text-brass' : ''}`}
                    />{' '}
                    <span className="text-steel">{r.lines_known === 1 ? 'line already known' : 'lines already known'}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
