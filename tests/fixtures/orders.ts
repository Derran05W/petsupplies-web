/**
 * Minimal inline order fixtures for unit tests. Each helper returns a
 * *cloned* value so a test that mutates the result cannot leak into others.
 */
import type { OrderSummary } from '@/types/order';

function clone<T>(value: T): T {
  return structuredClone(value);
}

const FIXTURE_ORDERS: OrderSummary[] = [
  {
    id: 'ord_fix_shipped',
    checkoutSessionId: 'cs_test_shipped',
    status: 'shipped',
    email: 'alice@example.com',
    shippingAddress: {
      fullName: 'Alice Test',
      line1: '123 Elm Street',
      city: 'Toronto',
      state: 'ON',
      postalCode: 'M5V 3A8',
      country: 'CA',
    },
    lines: [
      {
        id: 'ol_1',
        productId: 'fix-prod-1',
        slug: 'salmon-dry-dog-food',
        name: 'Salmon Dry Dog Food',
        imageUrl: '/images/salmon-kibble.jpg',
        quantity: 2,
        unitPriceCents: 2999,
        lineTotalCents: 5998,
      },
    ],
    subtotalCents: 5998,
    shippingCents: 0,
    taxCents: 780,
    totalCents: 6778,
    currency: 'cad',
    createdAt: '2026-05-01T14:00:00.000Z',
  },
  {
    id: 'ord_fix_paid',
    checkoutSessionId: 'cs_test_paid',
    status: 'paid',
    email: 'bob@example.com',
    shippingAddress: {
      fullName: 'Bob Test',
      line1: '45 Oak Avenue',
      city: 'Vancouver',
      state: 'BC',
      postalCode: 'V6B 2W7',
      country: 'CA',
    },
    lines: [
      {
        id: 'ol_2',
        productId: 'fix-prod-2',
        slug: 'tuna-cat-treats',
        name: 'Tuna Cat Treats',
        imageUrl: '',
        quantity: 1,
        unitPriceCents: 899,
        lineTotalCents: 899,
      },
    ],
    subtotalCents: 899,
    shippingCents: 599,
    taxCents: 117,
    totalCents: 1615,
    currency: 'cad',
    createdAt: '2026-05-15T09:30:00.000Z',
  },
];

function pickOrder(predicate: (order: OrderSummary) => boolean): OrderSummary {
  const found = FIXTURE_ORDERS.find(predicate);
  if (!found) throw new Error('OrderSummary fixture not found');
  return clone(found);
}

export function seededShippedOrder(): OrderSummary {
  return pickOrder((o) => o.status === 'shipped');
}

export function seededPaidOrder(): OrderSummary {
  return pickOrder((o) => o.status === 'paid');
}
