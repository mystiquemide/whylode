import Image from 'next/image';
import Link from 'next/link';
import { PrimaryLink } from './ui';

const REPO = 'https://github.com/mystiquemide/whylode';

export function Nav() {
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-6 sm:px-6">
      <Link href="/" aria-label="Whylode home">
        <Image src="/brand/logo.svg" alt="Whylode" width={125} height={32} priority />
      </Link>
      <nav className="hidden items-center gap-6 rounded-pill bg-ash px-5 py-2 text-[15px] md:flex">
        <Link href="/changes" className="hover:text-steel">Changes</Link>
        <Link href="/memoir" className="hover:text-steel">Memoir</Link>
        <Link href="/#how" className="hover:text-steel">How it works</Link>
      </nav>
      <PrimaryLink href="/changes">See a real run</PrimaryLink>
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
