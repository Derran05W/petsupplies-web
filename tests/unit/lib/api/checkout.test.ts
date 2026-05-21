import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckoutSession } from '@/lib/api/checkout';
import type { PendingCheckoutSnapshot } from '@/lib/checkout/storage';

const snapshot: PendingCheckoutSnapshot = {
  email: 'buyer@example.com',
  shippingAddress: {
    fullName: 'Taylor Verified',
    line1: '1 Main St',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'US',
  },
  lines: [],
  subtotalCents: 0,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 0,
  currency: 'usd',
  createdAt: new Date().toISOString(),
};

describe('lib/api/checkout', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('POSTs to /checkout/session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { url: 'https://checkout.stripe.com/cs_test', sessionId: 'cs_test' },
          { status: 200 },
        ),
      ),
    );

    await createCheckoutSession(
      {
        email: 'buyer@example.com',
        shippingAddress: snapshot.shippingAddress,
        lines: [{ productId: 'p1', quantity: 1 }],
      },
      snapshot,
    );

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/checkout/session',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
