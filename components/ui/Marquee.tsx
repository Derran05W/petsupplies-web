import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { PetIcon } from './PetIcon';

interface MarqueeProps {
  /** Phrases scrolled across the band; a paw icon separates each. */
  items: string[];
  className?: string;
}

/**
 * Infinite text marquee from the mockup (`.marquee`): hairline top/bottom
 * borders, uppercase tracked labels with paw separators, 30s linear loop
 * that pauses on hover. The track renders twice and translates -50% for a
 * seamless wrap (the mockup's `mq.innerHTML += mq.innerHTML` trick).
 * Decorative — hidden from assistive tech.
 */
export function Marquee({ items, className }: MarqueeProps) {
  const sequence = (
    <span className="inline-flex items-center gap-12">
      {items.map((item) => (
        <Fragment key={item}>
          {item}
          <PetIcon name="paw" className="size-3.5 flex-none" />
        </Fragment>
      ))}
    </span>
  );

  return (
    <div
      aria-hidden
      className={cn(
        'group overflow-hidden whitespace-nowrap border-y border-line py-[0.9rem]',
        className,
      )}
    >
      <div className="animate-marquee-x inline-flex items-center gap-12 font-body text-[0.74rem] font-semibold uppercase tracking-marquee text-ink-muted group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {sequence}
        {sequence}
      </div>
    </div>
  );
}
