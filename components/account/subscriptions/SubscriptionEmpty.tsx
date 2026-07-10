import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export function SubscriptionEmpty() {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-tile bg-tile-sage text-tile-sage-ink"
      >
        <RefreshCw size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          No Subscribe & Save plans yet
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          Choose Subscribe & Save on any eligible product to save on repeating
          deliveries — you can pause, resume, or update from here anytime.
        </p>
      </div>
      <Link
        href="/products"
        className="mt-2 inline-flex items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink no-underline transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        Browse products
      </Link>
    </section>
  );
}
