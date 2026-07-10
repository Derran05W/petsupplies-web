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
import type { Subscription } from '@/types/subscription';

/** Real backend `SubscriptionPublic` wire shape (nested product, uppercase enums). */
const API_SUB = {
  id: 'sub-1',
  userId: 'u1',
  productId: 'p1',
  product: {
    id: 'p1',
    slug: 'kibble',
    name: 'Kibble Bag',
    imageUrl: 'https://x.supabase.co/storage/v1/foo.jpg',
    price: 990,
  },
  petId: null,
  pet: null,
  quantity: 1,
  interval: 'WEEK_4',
  status: 'ACTIVE',
  discountPercent: 5,
  nextDeliveryAt: '2030-12-31T23:59:59.000Z',
  pausedAt: null,
  cancelledAt: null,
  createdAt: '2029-01-01T12:00:00.000Z',
  updatedAt: '2029-01-01T12:00:00.000Z',
};

/** The app `Subscription` the mapper should produce from `API_SUB`. */
const MAPPED: Subscription = {
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

  it('GET /users/me/subscriptions unwraps the { data: [...] } envelope and maps rows', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { data: [API_SUB], page: 1, limit: 20, total: 1, totalPages: 1 },
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const rows = await listSubscriptions({ accessToken: 'tok' });
    expect(rows).toEqual([MAPPED]);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET maps a bare array payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json([API_SUB], { status: 200 })),
    );
    const rows = await listSubscriptions({});
    expect(rows).toEqual([MAPPED]);
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

  it('POST /subscriptions sends only strict fields (uppercase interval) and maps checkoutSessionId', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            url: 'https://checkout.stripe.com/pay/cs_test',
            checkoutSessionId: 'cs_x',
          },
          { status: 200 },
        ),
      ),
    );
    const res = await createSubscriptionCheckout(
      {
        productId: 'p1',
        quantity: 2,
        interval: '2_weeks',
        petId: 'pet-1',
      },
      { accessToken: 'tok' },
    );
    expect(res.url).toContain('stripe.com');
    expect(res.sessionId).toBe('cs_x');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/subscriptions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          productId: 'p1',
          quantity: 2,
          interval: 'WEEK_2',
          petId: 'pet-1',
        }),
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
        Response.json(
          { message: 'DISCOUNT_STACKING_NOT_ALLOWED' },
          { status: 409 },
        ),
      ),
    );
    await expect(
      createSubscriptionCheckout(
        { productId: 'p1', quantity: 1, interval: '4_weeks' },
        { accessToken: 'tok' },
      ),
    ).rejects.toMatchObject({
      status: 409,
      message: 'DISCOUNT_STACKING_NOT_ALLOWED',
    });
  });

  it('pause + resume POST to scoped paths and map the response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ...API_SUB, status: 'PAUSED' }, { status: 200 }),
      ),
    );
    const paused = await pauseSubscription('sub-1', { accessToken: 't' });
    expect(paused.status).toBe('paused');
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

  it('PATCH converts interval to the uppercase enum and maps the response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { ...API_SUB, quantity: 3, interval: 'WEEK_8' },
          { status: 200 },
        ),
      ),
    );
    const updated = await updateSubscription(
      'sub-1',
      { quantity: 3, interval: '8_weeks' },
      { accessToken: 't' },
    );
    expect(updated.quantity).toBe(3);
    expect(updated.interval).toBe('8_weeks');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/subscriptions/sub-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ quantity: 3, interval: 'WEEK_8' }),
      }),
    );
  });

  it('DELETE cancel maps the returned Subscription body when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(API_SUB, { status: 200 })),
    );
    const body = await cancelSubscription('sub-1', { accessToken: 't' });
    expect(body).toEqual(MAPPED);
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
