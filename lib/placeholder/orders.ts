// TODO(phase 7): remove fallback once backend phase 8 is on staging
import type { OrderSummary } from '@/types/order';

/**
 * Two seeded `OrderSummary` rows for the dev fallback path in
 * `lib/api/orders.ts`. One paid (no tracking yet), one shipped (with
 * tracking) so the empty / status-pill / tracking-strip rendering can be
 * exercised without the staging API.
 *
 * IDs use the `ord_dev_seed_*` prefix so the per-order detail fallback
 * can recognise them deterministically. Phase 6's per-checkout synthesis
 * uses `ord_dev_<timestamp>` so the prefixes don't collide.
 */
export const PLACEHOLDER_ORDERS: OrderSummary[] = [
  {
    id: 'ord_dev_seed_shipped',
    checkoutSessionId: 'cs_test_seed_shipped',
    status: 'shipped',
    email: 'placeholder@pawsupply.com',
    shippingAddress: {
      fullName: 'Jane Smith',
      line1: '123 Maple Street',
      line2: 'Apt 4B',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      country: 'US',
    },
    lines: [
      {
        id: 'ol_seed_shipped_1',
        productId: 'prod_seed_kibble',
        slug: 'wholesome-kibble',
        name: 'Wholesome Grain-Free Kibble',
        imageUrl: '/images/hero-placeholder.jpg',
        quantity: 1,
        unitPriceCents: 4800,
        lineTotalCents: 4800,
      },
      {
        id: 'ol_seed_shipped_2',
        productId: 'prod_seed_treats',
        slug: 'salmon-training-treats',
        name: 'Salmon Training Treats',
        imageUrl: '/images/hero-placeholder.jpg',
        quantity: 2,
        unitPriceCents: 1200,
        lineTotalCents: 2400,
      },
    ],
    subtotalCents: 7200,
    shippingCents: 0,
    taxCents: 0,
    totalCents: 7200,
    currency: 'usd',
    createdAt: '2026-04-22T15:42:00.000Z',
    trackingNumber: 'TRK123456789US',
    trackingUrl: 'https://example.com/tracking/TRK123456789US',
  },
  {
    id: 'ord_dev_seed_paid',
    checkoutSessionId: 'cs_test_seed_paid',
    status: 'paid',
    email: 'placeholder@pawsupply.com',
    shippingAddress: {
      fullName: 'Jane Smith',
      line1: '123 Maple Street',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      country: 'US',
    },
    lines: [
      {
        id: 'ol_seed_paid_1',
        productId: 'prod_seed_collar',
        slug: 'reflective-walking-collar',
        name: 'Reflective Walking Collar',
        imageUrl: '/images/hero-placeholder.jpg',
        quantity: 1,
        unitPriceCents: 2800,
        lineTotalCents: 2800,
      },
    ],
    subtotalCents: 2800,
    shippingCents: 599,
    taxCents: 0,
    totalCents: 3399,
    currency: 'usd',
    createdAt: '2026-05-01T09:14:00.000Z',
  },
];
