import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  /** Icon rendered inside the small brand-50 chip. */
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
  if (delta > 0) return 'bg-brand-50 text-brand-600';
  if (delta < 0) return 'bg-amber-50 text-amber-700';
  return 'bg-warm-100 text-warm-600';
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
        'flex flex-col gap-3 rounded-2xl border border-warm-200 bg-white p-5 transition-shadow',
        href && 'hover:shadow-sm',
      )}
    >
      <header className="flex items-center justify-between">
        <p className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
          {label}
        </p>
        <span
          aria-hidden
          className="inline-flex size-8 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <Icon size={16} />
        </span>
      </header>
      <p className="font-display text-3xl tracking-[-0.02em] text-warm-900">
        {value}
      </p>
      {deltaPercent !== undefined && deltaPercent !== null && (
        <span
          className={cn(
            'inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 font-body text-xs font-medium',
            deltaClassName(deltaPercent),
          )}
        >
          {deltaPercent > 0 && <ArrowUpRight size={12} aria-hidden />}
          {deltaPercent < 0 && <ArrowDownRight size={12} aria-hidden />}
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
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
