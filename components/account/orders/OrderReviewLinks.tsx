import Link from 'next/link';
import type { OrderSummary } from '@/types/order';

const REVIEWABLE_STATUSES: ReadonlyArray<OrderSummary['status']> = [
  'paid',
  'shipped',
  'fulfilled',
  'delivered',
];

interface OrderReviewLinksProps {
  order: OrderSummary;
}

/**
 * Links eligible line items to the PDP review form (account-required).
 */
export function OrderReviewLinks({ order }: OrderReviewLinksProps) {
  if (!REVIEWABLE_STATUSES.includes(order.status)) {
    return null;
  }

  const lines = order.lines.filter((line) => line.slug.length > 0);
  if (lines.length === 0) return null;

  return (
    <section
      aria-labelledby="order-reviews-heading"
      className="mt-6 w-full max-w-2xl rounded-card border border-line bg-paper px-6 py-5 md:px-8"
    >
      <h2
        id="order-reviews-heading"
        className="font-display text-xl tracking-[-0.01em] text-ink"
      >
        Share your experience
      </h2>
      <p className="mt-1 font-body text-sm leading-body text-ink-secondary">
        Reviews are linked to your account after a qualifying purchase.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.id}>
            <Link
              href={`/products/${line.slug}#reviews`}
              className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
            >
              Review {line.name}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
