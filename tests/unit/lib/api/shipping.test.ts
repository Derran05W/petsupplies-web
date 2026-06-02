import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { isShippingRateStaleError, quoteShipping } from '@/lib/api/shipping';

describe('lib/api/shipping', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('POST /shipping/quote with inline CA address', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            source: 'fallback',
            options: [
              {
                serviceCode: 'FLAT',
                serviceName: 'Standard shipping',
                carrier: 'FLAT',
                amountCents: 599,
                selectionToken: 'sel_tok',
              },
            ],
            expiresAt: new Date().toISOString(),
          },
          { status: 200 },
        ),
      ),
    );

    const quote = await quoteShipping(
      {
        line1: '123 Main',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V2T6',
        country: 'CA',
      },
      { accessToken: 'tok' },
    );

    expect(quote.options).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/shipping/quote',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('detects stale shipping rate errors', () => {
    expect(
      isShippingRateStaleError(new ApiError('SHIPPING_RATE_STALE', 409)),
    ).toBe(true);
  });
});
