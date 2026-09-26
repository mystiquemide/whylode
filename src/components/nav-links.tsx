'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/changes', label: 'Changes', match: (p: string) => p.startsWith('/changes') },
  { href: '/memoir', label: 'Memoir', match: (p: string) => p.startsWith('/memoir') },
  { href: '/#how', label: 'How it works', match: () => false },
];

export function NavLinks({ className = '' }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  return (
    <nav aria-label="Main" className={`items-center gap-1 rounded-pill bg-ash p-1 text-[15px] ${className}`}>
      {LINKS.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-pill px-4 py-1.5 ${active ? 'bg-white text-graphite' : 'text-steel hover:text-graphite'}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The "See a real run" button, hidden while already viewing a change. */
export function RealRunButton({ href }: { href: string }) {
  const pathname = usePathname() ?? '/';
  if (pathname.startsWith('/changes/')) return null;
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center justify-center rounded-pill bg-graphite px-5 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-black"
    >
      See a real run
    </Link>
  );
}
