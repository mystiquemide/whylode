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
      </main>
      <Footer />
    </>
  );
}
