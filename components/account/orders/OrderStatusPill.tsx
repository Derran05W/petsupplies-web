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
 * Boutique tonal-tile colour map for order status pills. Strictly uses
 * design tokens (`tile-*` gradients + token inks). Never `gray-*`.
 *
 *   pending    → amber tile  (waiting on payment)
 *   paid       → amber tile  (confirmed; processing family)
 *   fulfilled  → amber tile  (warehouse done; pre-carrier)
 *   shipped    → slate tile  (in transit — visually distinct)
 *   delivered  → sage tile   (terminal happy state)
 *   cancelled  → panel, struck (terminal sad state)
 *   refunded   → panel       (terminal money-back state)
 */
const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
  paid: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
  fulfilled: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
  shipped: 'border-slate/40 bg-tile-slate text-tile-slate-ink',
  delivered: 'border-pine/40 bg-tile-sage text-tile-sage-ink',
  cancelled: 'border-line bg-panel text-ink-muted line-through',
  refunded: 'border-line bg-panel text-ink-muted',
};

export function OrderStatusPill({ status, className }: OrderStatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
