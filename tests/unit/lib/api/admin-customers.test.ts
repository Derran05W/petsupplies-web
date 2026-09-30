import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminListCustomers,
  adminGetCustomer,
  adminGetCustomerSubscriptions,
} from '@/lib/api/admin/customers';

describe('lib/api/admin/customers', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET list sends limit + email and maps the wire envelope', async () => {
    // Backend filters by `email` and returns a { data, page, limit, ... } envelope.
    const payload = {
      data: [
        {
          id: 'usr_1',
          email: 'foo@x.com',
          name: 'Foo',
          role: 'CUSTOMER',
          createdAt: '2026-01-01T00:00:00.000Z',
          orderCount: 3,
          lifetimeValueCents: 9900,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const s = String(url);
        expect(s).toContain('/admin/customers?');
        expect(s).toContain('limit=20');
        expect(s).toContain('email=foo');
        return Response.json(payload, { status: 200 });
      }),
    );

    const res = await adminListCustomers({
      page: 1,
      search: 'foo',
      accessToken: 'tok',
    });
    expect(res.pageSize).toBe(20);
    expect(res.customers).toHaveLength(1);
    expect(res.customers[0]?.ordersCount).toBe(3);
    expect(res.customers[0]?.currency).toBe('cad');
  });

  it('GET list omits the email param for a query shorter than 2 characters', async () => {
    // Backend rejects `email` searches under 2 chars with a 400; the client must
    // send an unfiltered request instead.
    const fetchMock = vi.fn(async (url: string | URL) => {
      const s = String(url);
      expect(s).toContain('/admin/customers?');
      expect(s).not.toContain('email=');
      return Response.json(
        { data: [], page: 1, limit: 20, total: 0, totalPages: 0 },
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await adminListCustomers({ search: 'a', accessToken: 'tok' });
    await adminListCustomers({ search: '   ', accessToken: 'tok' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('GET subscriptions unwraps the { data } envelope and maps wire rows', async () => {
    // Standard envelope of raw Prisma rows: UPPERCASE enums, `nextDeliveryAt`,
    // and NO nested product relation (productId only).
    const payload = {
      data: [
        {
          id: 'sub_1',
          productId: 'prod_9',
          petId: null,
          quantity: 2,
          interval: 'WEEK_4',
          status: 'ACTIVE',
          discountPercent: 10,
          nextDeliveryAt: '2026-03-01T00:00:00.000Z',
          stripeSubscriptionId: 'sub_stripe',
          stripePriceId: 'price_1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
          pausedAt: null,
          cancelledAt: null,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/customers/cus_1/subscriptions');
        return Response.json(payload, { status: 200 });
      }),
    );

    const subs = await adminGetCustomerSubscriptions('cus_1', {
      accessToken: 'tok',
    });
    expect(subs).toHaveLength(1);
    const sub = subs[0]!;
    expect(sub.interval).toBe('4_weeks');
    expect(sub.status).toBe('active');
    expect(sub.currentPeriodEnd).toBe('2026-03-01T00:00:00.000Z');
    expect(sub.productId).toBe('prod_9');
    expect(sub.quantity).toBe(2);
    // Admin select carries no product price; the UI omits it when 0.
    expect(sub.unitPriceCents).toBe(0);
  });

  it('GET subscriptions returns [] for an empty envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          { data: [], page: 1, limit: 20, total: 0, totalPages: 0 },
          { status: 200 },
        ),
      ),
    );

    const subs = await adminGetCustomerSubscriptions('cus_1', {
      accessToken: 'tok',
    });
    expect(subs).toEqual([]);
  });

  it('GET detail encodes id and flattens the counts object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/customers/cus_abc%2F1');
        return Response.json(
          {
            id: 'cus_abc/1',
            email: 'x@y.com',
            name: null,
            role: 'CUSTOMER',
            createdAt: '2026-01-01T00:00:00.000Z',
            counts: { orders: 4, subscriptions: 2 },
            lifetimeValueCents: 12000,
            lastOrderAt: '2026-02-01T00:00:00.000Z',
          },
          { status: 200 },
        );
      }),
    );

    const row = await adminGetCustomer('cus_abc/1', { accessToken: 'tok' });
    expect(row.email).toBe('x@y.com');
    expect(row.ordersCount).toBe(4);
    expect(row.subscriptionsCount).toBe(2);
    expect(row.lastOrderAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
