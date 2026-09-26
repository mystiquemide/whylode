'use client';

import { StaticNav } from '@/components/static-nav';
import { TextLink } from '@/components/ui';

export default function ChangesError({ reset }: { reset: () => void }) {
  return (
    <>
      <StaticNav />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-24 sm:px-6">
        <h1 className="display text-[40px] leading-[1.2]">Can&apos;t reach the Whylode store right now.</h1>
        <div className="mt-6"><TextLink onClick={reset}>Try again</TextLink></div>
      </main>
    </>
  );
}
