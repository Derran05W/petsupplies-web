import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  /** Icon rendered inside the small paper chip. */
  icon: LucideIcon;
  /**
   * Week-over-week delta as a signed integer (positive = up, negative
   * = down). Rendered as a small pill below the value. Pass `null` to
   * suppress the delta entirely (low-stock alerts have no comparison).
   */
  deltaPercent?: number | null;
  /** When provided, the entire card becomes a link. */
  href?: string;
}

function deltaClassName(delta: number): string {
  if (delta > 0) return 'text-pine';
  if (delta < 0) return 'text-danger-solid';
  return 'text-ink-muted';
}

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPercent,
  href,
}: StatCardProps) {
  const inner = (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-card border border-line bg-panel p-5 transition-shadow duration-base ease-soft',
        href && 'hover:shadow-sm',
      )}
    >
      <header className="flex items-center justify-between">
        <p className="font-body text-micro uppercase text-ink-muted">{label}</p>
        <span
          aria-hidden
          className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-paper text-pine"
        >
          <Icon size={16} />
        </span>
      </header>
      <p className="font-display text-3xl tracking-tight-display text-ink">
        {value}
      </p>
      {deltaPercent !== undefined && deltaPercent !== null && (
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1 font-body text-micro uppercase',
            deltaClassName(deltaPercent),
          )}
        >
          {deltaPercent > 0 && <span aria-hidden>↑</span>}
          {deltaPercent < 0 && <span aria-hidden>↓</span>}
          {deltaPercent === 0 ? (
            <span>No change vs last week</span>
          ) : (
            <span>{Math.abs(deltaPercent)}% vs last week</span>
          )}
        </span>
      )}
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
