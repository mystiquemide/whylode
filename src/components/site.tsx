import Image from 'next/image';
import Link from 'next/link';
import { NavLinks, RealRunButton } from './nav-links';
import { realRunHref } from '@/lib/store/landing';

const REPO = 'https://github.com/mystiquemide/whylode';

export async function Nav() {
  const runHref = await realRunHref();
  return (
    <header className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="Whylode home">
          <Image src="/brand/logo.svg" alt="Whylode" width={125} height={32} priority />
        </Link>
        <NavLinks className="hidden md:flex" />
        <div className="flex justify-end">
          <RealRunButton href={runHref} />
        </div>
      </div>
      <NavLinks className="mt-4 flex w-fit md:hidden" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-mist">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 py-8 text-[14px] text-steel sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-5">
          <Image src="/brand/logo.svg" alt="Whylode" width={94} height={24} />
          <Link href="/changes" className="hover:text-graphite">Changes</Link>
          <Link href="/memoir" className="hover:text-graphite">Memoir</Link>
          <a href={REPO} className="hover:text-graphite">GitHub</a>
          <a href={`${REPO}/tree/main/bob_sessions`} className="hover:text-graphite">Session reports</a>
        </div>
      </div>
    </footer>
  );
}
