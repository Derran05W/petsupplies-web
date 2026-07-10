import Link from 'next/link';
import type { OrderSummary } from '@/types/order';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { OrderStatusPill } from './OrderStatusPill';

interface OrderRowProps {
  order: OrderSummary;
  /** Preserved on detail links (e.g. `returnTo` when entering account from shop). */
  extraQuery?: Record<string, string | undefined>;
}

function shortId(id: string): string {
  return `#${id.slice(-8)}`;
}

function pluralise(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function detailHref(
  orderId: string,
  extraQuery?: Record<string, string | undefined>,
): string {
  const base = `/account/orders/${orderId}`;
  if (!extraQuery) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraQuery)) {
    if (value && value.length > 0) params.set(key, value);
  }
  const qs = params.toString();
  return qs.length > 0 ? `${base}?${qs}` : base;
}

/**
 * Server-rendered row in the orders list. The whole row is a link so
 * SR users get one focusable element per order; visual hierarchy puts
 * the status pill + total on the right at desktop sizes, and stacks
 * below the order id / date on mobile.
 */
export function OrderRow({ order, extraQuery }: OrderRowProps) {
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <li>
      <Link
        href={detailHref(order.id, extraQuery)}
        className="group flex flex-col gap-3 px-2 py-4 transition-colors duration-fast hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine sm:flex-row sm:items-center sm:gap-6 sm:px-3 sm:py-5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-body text-sm font-medium text-ink">
              Order {shortId(order.id)}
            </span>
            <OrderStatusPill status={order.status} />
          </div>
          <p className="font-body text-xs text-ink-muted">
            {formatDate(order.createdAt)} ·{' '}
            {pluralise(itemCount, 'item', 'items')}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="font-display text-lg tracking-[-0.02em] text-ink">
            {formatPrice(order.totalCents, order.currency)}
          </span>
          <span className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast group-hover:opacity-100">
            View
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}
