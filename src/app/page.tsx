import Image from 'next/image';
import { Footer, Nav } from '@/components/site';
import { Eyebrow, PrimaryLink, StateTag, TextLink } from '@/components/ui';
import { getHeroProof } from '@/lib/store/landing';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const proof = await getHeroProof().catch(() => null);

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-16">
          <div>
            <Eyebrow>For IBM i teams</Eyebrow>
            <h1 className="display mt-6 text-[44px] leading-[1.0] sm:text-[66px] sm:leading-[0.95]">
              The code survived. The reason didn&apos;t. Keep the{' '}
              <span className="text-brass underline decoration-1 underline-offset-[8px]">why</span>.
            </h1>
            <p className="mt-8 max-w-xl text-[18px] leading-[1.5] text-steel">
              Whylode runs inside IBM Bob. When a rule changes, it traces every line that has to change, asks the one
              person who knows why, and keeps the answer.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <PrimaryLink href="/changes">See a real run</PrimaryLink>
              <TextLink href="/memoir">View the memoir</TextLink>
            </div>
          </div>

          <div className="relative lg:pb-20">
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
                  <StateTag state="kept" />
                </div>
                <p className="mt-2 border-l-2 border-brass bg-ivory px-3 py-1.5 font-mono text-[13px]">{proof.code}</p>
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
            <div className="relative -mr-4 rounded-tl-[8px] bg-ash sm:-mr-6 xl:mr-[calc((1200px-100vw)/2-24px)]">
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
