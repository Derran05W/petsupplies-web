import Link from 'next/link';
import { ChevronRight, CreditCard } from 'lucide-react';

export function PaymentMethodsSection() {
  return (
    <section
      id="payments"
      aria-labelledby="payments-heading"
      className="scroll-mt-24 rounded-2xl border border-warm-200 bg-surface-card p-6 md:p-8"
    >
      <h2
        id="payments-heading"
        className="mb-1 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Payment methods
      </h2>
      <p className="mb-6 font-body text-sm text-warm-600">
        Cards and billing for subscriptions are managed with Stripe through your
        Subscribe & Save hub.
      </p>
      <Link
        href="/account/subscriptions"
        className="bg-warm-50/40 flex items-center justify-between gap-4 rounded-xl border border-warm-200 px-4 py-4 transition-colors hover:border-warm-300"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-full bg-surface-card text-brand-600 shadow-sm"
          >
            <CreditCard size={18} />
          </span>
          <span className="font-body text-sm font-medium text-warm-900">
            Open Subscribe & Save
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
