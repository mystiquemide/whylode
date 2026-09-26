import Image from 'next/image';
import Link from 'next/link';
import { NavLinks } from './nav-links';

/** Header for error pages: no data access, safe inside client components. */
export function StaticNav() {
  return (
    <header className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="Whylode home">
          <Image src="/brand/logo.svg" alt="Whylode" width={125} height={32} priority />
        </Link>
        <NavLinks className="hidden md:flex" />
      </div>
      <NavLinks className="mt-4 flex w-fit md:hidden" />
    </header>
  );
}
