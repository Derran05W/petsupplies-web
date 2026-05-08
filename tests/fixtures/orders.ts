/**
 * Thin facade over `lib/placeholder/orders.ts` so tests can grab the
 * shipped / paid orders by intent rather than array index.
 */
import { PLACEHOLDER_ORDERS } from '@/lib/placeholder/orders';
import type { OrderSummary } from '@/types/order';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function pickOrder(predicate: (order: OrderSummary) => boolean): OrderSummary {
  const found = PLACEHOLDER_ORDERS.find(predicate);
  if (!found) throw new Error('OrderSummary fixture not found');
  return clone(found);
}

export function seededShippedOrder(): OrderSummary {
  return pickOrder((o) => o.status === 'shipped');
}

export function seededPaidOrder(): OrderSummary {
  return pickOrder((o) => o.status === 'paid');
}
