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
      className="mt-6 w-full max-w-2xl rounded-2xl border border-warm-200 bg-surface-card px-6 py-5 shadow-sm md:px-8"
    >
      <h2
        id="order-reviews-heading"
        className="font-display text-lg tracking-[-0.02em] text-warm-900"
      >
        Share your experience
      </h2>
      <p className="mt-1 font-body text-sm text-warm-600">
        Reviews are linked to your account after a qualifying purchase.
      </p>
      <ul className="mt-4 flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.id}>
            <Link
              href={`/products/${line.slug}#reviews`}
              className="font-body text-sm font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
            >
              Review {line.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
