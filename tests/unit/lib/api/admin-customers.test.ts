import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminListCustomers,
  adminGetCustomer,
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
