import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface OrderStatusPillProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/**
 * Brand-aligned colour map for order status pills. Strictly uses
 * `brand-*` / `warm-*` tokens with one Tailwind-ships-by-default
 * `amber-*` accent for the in-transit state. Never `gray-*`.
 *
 *   pending    → warm pill          (waiting on payment)
 *   paid       → brand pill         (confirmed)
 *   fulfilled  → brand pill         (warehouse done; pre-carrier)
 *   shipped    → amber pill         (in transit — visually distinct)
 *   delivered  → deeper brand pill  (terminal happy state)
 *   cancelled  → warm pill, struck  (terminal sad state)
 *   refunded   → warm pill          (terminal money-back state)
 */
const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-warm-200 text-warm-600',
  paid: 'bg-brand-50 text-brand-600',
  fulfilled: 'bg-brand-50 text-brand-600',
  shipped: 'bg-amber-50 text-amber-700',
  delivered: 'bg-brand-100 text-brand-700',
  cancelled: 'bg-warm-200 text-warm-600 line-through',
  refunded: 'bg-warm-200 text-warm-600',
};

export function OrderStatusPill({ status, className }: OrderStatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-1 font-body text-xs font-medium uppercase tracking-[0.06em]',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
