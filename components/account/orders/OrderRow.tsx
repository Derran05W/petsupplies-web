import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { OrderSummary } from '@/types/order';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { OrderStatusPill } from './OrderStatusPill';

interface OrderRowProps {
  order: OrderSummary;
}

function shortId(id: string): string {
  return `#${id.slice(-8)}`;
}

function pluralise(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/**
 * Server-rendered row in the orders list. The whole row is a link so
 * SR users get one focusable element per order; visual hierarchy puts
 * the status pill + total on the right at desktop sizes, and stacks
 * below the order id / date on mobile.
 */
export function OrderRow({ order }: OrderRowProps) {
  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <li>
      <Link
        href={`/account/orders/${order.id}`}
        className="group flex flex-col gap-3 rounded-2xl border border-warm-200 bg-white px-5 py-4 transition-colors hover:border-warm-300 hover:shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-body text-sm font-medium text-warm-900">
              Order {shortId(order.id)}
            </span>
            <OrderStatusPill status={order.status} />
          </div>
          <p className="font-body text-xs text-warm-600">
            {formatDate(order.createdAt)} ·{' '}
            {pluralise(itemCount, 'item', 'items')}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="font-display text-lg tracking-[-0.02em] text-warm-900">
            {formatPrice(order.totalCents, order.currency)}
          </span>
          <span className="inline-flex items-center gap-1 font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600 transition-colors group-hover:text-brand-700">
            View
            <ChevronRight size={14} aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}
