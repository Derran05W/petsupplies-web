import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';

export function AddressesSection() {
  return (
    <section
      id="addresses"
      aria-labelledby="addresses-heading"
      className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
    >
      <h2
        id="addresses-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Addresses
      </h2>
      <p className="mb-6 font-body text-sm text-warm-600">
        Shipping addresses used at checkout and for Subscribe & Save.
      </p>
      <Link
        href="/account/addresses"
        className="bg-warm-50/40 flex items-center justify-between gap-4 rounded-xl border border-warm-200 px-4 py-4 transition-colors hover:border-warm-300"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-full bg-surface-card text-brand-600 shadow-sm"
          >
            <MapPin size={18} />
          </span>
          <span className="font-body text-sm font-medium text-warm-900">
            Manage address book
          </span>
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-warm-400"
          aria-hidden
        />
      </Link>
    </section>
  );
}
