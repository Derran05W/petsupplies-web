import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckoutSession } from '@/lib/api/checkout';

describe('lib/api/checkout', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('POSTs {} to /checkout/session with auth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { url: 'https://checkout.stripe.com/cs_test', orderId: 'ord_1' },
          { status: 200 },
        ),
      ),
    );

    await createCheckoutSession({}, { accessToken: 'token-abc' });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/checkout/session',
      expect.objectContaining({
        method: 'POST',
        body: '{}',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
        }),
      }),
    );
  });

  it('POSTs shippingSelection when provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { url: 'https://checkout.stripe.com/cs_test', orderId: 'ord_2' },
          { status: 200 },
        ),
      ),
    );

    await createCheckoutSession(
      {
        shippingSelection: {
          selectionToken: 'tok',
          serviceCode: 'DOM.EP',
          amountCents: 1299,
          line1: '1 Main',
          city: 'Toronto',
          region: 'ON',
          postalCode: 'M5V2T6',
          country: 'CA',
        },
      },
      { accessToken: 'token-abc' },
    );

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/checkout/session',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('shippingSelection'),
      }),
    );
  });
});
