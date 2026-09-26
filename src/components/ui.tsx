import Link from 'next/link';
import type { ReactNode } from 'react';

export type LineState = 'traced' | 'asked' | 'answered' | 'known' | 'conflict' | 'kept' | 'changed';

const STATE_LABEL: Record<LineState, string> = {
  traced: 'Traced by Bob',
  asked: 'Asked',
  answered: 'Answered',
  known: 'Already known',
  conflict: 'Conflict',
  kept: 'Kept',
  changed: 'Changed',
};

/** Left rule and wash for a code line in each state. */
export function lineStateClass(state: LineState | null | undefined): string {
  switch (state) {
    case 'traced':
    case 'changed':
      return 'border-l-2 border-graphite';
    case 'asked':
      return 'border-l-2 border-ember';
    case 'answered':
    case 'known':
    case 'kept':
      return 'border-l-2 border-brass bg-ivory';
    case 'conflict':
      return 'border-l-2 border-ember bg-graphite text-white';
    default:
      return 'border-l-2 border-transparent';
  }
}

/** Small printed-report marker: ember square, brass label. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[13px] leading-[1.38] text-brass">
      <span aria-hidden className="inline-block h-2 w-2 bg-ember" />
      {children}
    </p>
  );
}

export function StateTag({ state }: { state: LineState }) {
  const tone =
    state === 'conflict'
      ? 'bg-graphite text-white'
      : state === 'asked'
        ? 'bg-ash text-graphite ring-1 ring-inset ring-ember'
        : state === 'answered' || state === 'known' || state === 'kept'
          ? 'bg-ivory text-brass'
          : 'bg-ash text-graphite';
  return (
    <span className={`inline-flex items-center rounded-tag px-2.5 py-0.5 text-[13px] font-medium ${tone}`}>
      {STATE_LABEL[state]}
    </span>
  );
}

export type CodeLine = { no: number; text: string; state?: LineState | null };

/** Real source with real line numbers. Shared leading blank columns are trimmed. */
export function CodeBlock({ lines, label }: { lines: CodeLine[]; label?: string }) {
  const indents = lines.filter((l) => l.text.trim()).map((l) => l.text.match(/^ */)![0].length);
  const trim = indents.length ? Math.min(...indents) : 0;
  return (
    <figure className="overflow-hidden rounded-panel bg-white">
      {label && (
        <figcaption className="flex items-center justify-between border-b border-mist px-4 py-2 font-mono text-[13px] text-slate">
          <span>{label}</span>
          <span className="font-sans text-[12px] sm:hidden">Scroll sideways for full lines</span>
        </figcaption>
      )}
      <pre className="overflow-x-auto py-2 font-mono text-[12px] leading-6 sm:text-[14px]">
        {lines.map((l) => (
          <div key={l.no} className={`line-state flex min-w-max pr-4 ${lineStateClass(l.state)}`}>
            <span className={`w-10 shrink-0 select-none pr-3 text-right sm:w-12 ${l.state === 'conflict' ? 'text-white/60' : 'text-slate'}`}>
              {l.no}
            </span>
            <span className="whitespace-pre">{l.text.slice(trim)}</span>
          </div>
        ))}
      </pre>
    </figure>
  );
}

const PILL = 'inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', ...rest } = props;
  return <button {...rest} className={`${PILL} bg-graphite text-white hover:bg-black ${className}`} />;
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${PILL} bg-graphite text-white hover:bg-black`}>
      {children}
    </Link>
  );
}

/** Secondary action: text with an ember underline and a chevron. Never an outlined button. */
export function TextLink({ href, children, onClick }: { href?: string; children: ReactNode; onClick?: () => void }) {
  const cls =
    'inline-flex items-center gap-1 text-[15px] font-medium text-graphite underline decoration-ember decoration-1 underline-offset-[5px] hover:decoration-2';
  const chevron = <span aria-hidden>&rsaquo;</span>;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
        {chevron}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
      {chevron}
    </button>
  );
}
