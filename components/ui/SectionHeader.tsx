import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Uppercase eyebrow line (`.kicker` in the mockup) — pine by default. */
  kicker: string;
  /**
   * Heading content (`.h2`). Wrap emphasis words in `<em>` — they render
   * italic at weight 500 per the mockup's `.h2 em` rule.
   */
  children: React.ReactNode;
  align?: 'left' | 'center';
  /** Dark-band variant (film band): amber kicker, paper heading. */
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  kicker,
  children,
  align = 'left',
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <span
        className={cn(
          'mb-[1.1rem] block font-body text-kicker uppercase',
          dark ? 'text-amber' : 'text-pine',
        )}
      >
        {kicker}
      </span>
      <h2
        className={cn(
          'max-w-[22ch] font-display text-display [&_em]:font-medium [&_em]:italic',
          dark ? 'text-paper' : 'text-ink',
          align === 'center' && 'mx-auto',
        )}
      >
        {children}
      </h2>
    </div>
  );
}
