import { Button, TONE_CLASSES } from '@/components/ui';

/**
 * Server component — the friendly `/checkout/cancel` panel that Stripe
 * sends customers to when they back out of hosted checkout. We do NOT
 * clear the cart here; it's still saved client-side so the customer can
 * pick back up where they left off.
 */
export function CancelContents() {
  return (
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-card border border-line bg-paper px-6 py-10 text-center md:px-10 md:py-12">
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.slate}`}
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
      <h1 className="font-display text-title text-ink">Checkout cancelled.</h1>
      <p className="font-body text-sm leading-body text-ink-secondary">
        Your cart is still saved. You can pick back up whenever you&apos;re
        ready.
      </p>
      <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
        <Button href="/cart" className="flex-1 px-5 py-2.5">
          Return to cart
        </Button>
        <Button variant="ghost" href="/products" className="flex-1 px-5 py-2.5">
          Keep shopping
        </Button>
      </div>
    </section>
  );
}
