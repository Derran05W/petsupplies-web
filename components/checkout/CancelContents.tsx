import Link from 'next/link';

/**
 * Server component — the friendly `/checkout/cancel` panel that Stripe
 * sends customers to when they back out of hosted checkout. We do NOT
 * clear the cart here; it's still saved client-side so the customer can
 * pick back up where they left off.
 */
export function CancelContents() {
  return (
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-warm-200 bg-surface-card px-6 py-10 text-center shadow-sm md:px-10 md:py-12">
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9" />
          <polyline points="3 4 3 12 11 12" />
        </svg>
      </span>
      <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900">
        Checkout cancelled.
      </h1>
      <p className="font-body text-sm text-warm-600">
        Your cart is still saved. You can pick back up whenever you&apos;re
        ready.
      </p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/cart"
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
        >
          Return to cart
        </Link>
        <Link
          href="/products"
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          Keep shopping
        </Link>
      </div>
    </section>
  );
}
