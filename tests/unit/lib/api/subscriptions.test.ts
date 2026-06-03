import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  cancelSubscription,
  createSubscriptionCheckout,
  listSubscriptions,
  pauseSubscription,
  resumeSubscription,
  updateSubscription,
} from '@/lib/api/subscriptions';

const SAMPLE: import('@/types/subscription').Subscription = {
  id: 'sub-1',
  productId: 'p1',
  productSlug: 'kibble',
  productName: 'Kibble Bag',
  productImageUrl: 'https://x.supabase.co/storage/v1/foo.jpg',
  quantity: 1,
  interval: '4_weeks',
  unitPriceCents: 990,
  status: 'active',
  cancelAtPeriodEnd: false,
  currentPeriodEnd: '2030-12-31T23:59:59.000Z',
  petId: null,
  createdAt: '2029-01-01T12:00:00.000Z',
};

describe('lib/api/subscriptions', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET /users/me/subscriptions parses a bare Subscription[] payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([SAMPLE], {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

    const rows = await listSubscriptions({ accessToken: 'tok' });
    expect(rows).toEqual([SAMPLE]);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET normalises { subscriptions: [] } wrapper', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ subscriptions: [SAMPLE] }, { status: 200 }),
      ),
    );
    const rows = await listSubscriptions({});
    expect(rows).toEqual([SAMPLE]);
  });

  it('GET throws ApiError on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    await expect(listSubscriptions({})).rejects.toBeInstanceOf(ApiError);
  });

  it('POST /subscriptions creates checkout session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { url: 'https://checkout.stripe.com/pay/cs_test', sessionId: 'cs_x' },
          { status: 200 },
        ),
      ),
    );
    const res = await createSubscriptionCheckout(
      {
        productId: 'p1',
        quantity: 2,
        interval: '2_weeks',
        successUrl: 'https://app.test/account/subscriptions',
        cancelUrl: 'https://app.test/products/kibble',
        clientReferenceId: 'user-1',
      },
      { accessToken: 'tok' },
    );
    expect(res.url).toContain('stripe.com');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/subscriptions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('POST /subscriptions throws ApiError on 409', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ message: 'Discount conflict' }, { status: 409 }),
      ),
    );
    await expect(
      createSubscriptionCheckout(
        {
          productId: 'p1',
          quantity: 1,
          interval: '4_weeks',
          successUrl: 'https://a',
          cancelUrl: 'https://b',
        },
        { accessToken: 'tok' },
      ),
    ).rejects.toMatchObject({
      status: 409,
      message: 'Discount conflict',
    });
  });

  it('pause + resume POST to scoped paths', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...SAMPLE, status: 'paused' }, { status: 200 }),
      ),
    );
    await pauseSubscription('sub-1', { accessToken: 't' });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions/sub-1/pause',
      expect.objectContaining({ method: 'POST' }),
    );

    await resumeSubscription('sub-1', { accessToken: 't' });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions/sub-1/resume',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('PATCH updates subscription', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(SAMPLE, { status: 200 })),
    );
    await updateSubscription(
      'sub-1',
      { quantity: 3, interval: '8_weeks' },
      { accessToken: 't' },
    );
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions/sub-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ quantity: 3, interval: '8_weeks' }),
      }),
    );
  });

  it('DELETE cancel returns Subscription body when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...SAMPLE, cancelAtPeriodEnd: true }, { status: 200 }),
      ),
    );
    const body = await cancelSubscription('sub-1', { accessToken: 't' });
    expect(body?.cancelAtPeriodEnd).toBe(true);
  });

  it('DELETE maps 204 to undefined', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    const body = await cancelSubscription('sub-1', {});
    expect(body).toBeUndefined();
  });
});
