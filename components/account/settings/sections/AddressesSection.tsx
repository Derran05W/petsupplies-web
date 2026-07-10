import Link from 'next/link';
import { MapPin } from 'lucide-react';

export function AddressesSection() {
  return (
    <section
      id="addresses"
      aria-labelledby="addresses-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="addresses-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Addresses
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Shipping addresses used at checkout and for Subscribe & Save.
      </p>
      <Link
        href="/account/addresses"
        className="flex items-center justify-between gap-4 rounded-tile border border-line bg-panel px-4 py-4 transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-tile bg-paper text-pine"
          >
            <MapPin size={18} />
          </span>
          <span className="font-body text-sm font-medium text-ink">
            Manage address book
          </span>
        </span>
        <span aria-hidden className="shrink-0 font-body text-ink-muted">
          →
        </span>
      </Link>
    </section>
  );
}
