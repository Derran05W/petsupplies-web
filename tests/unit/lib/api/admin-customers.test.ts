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

  it('GET list builds query string', async () => {
    const payload = {
      customers: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/customers?');
        expect(String(url)).toContain('search=foo');
        return Response.json(payload, { status: 200 });
      }),
    );

    const res = await adminListCustomers({
      page: 1,
      search: 'foo',
      accessToken: 'tok',
    });
    expect(res.customers).toEqual([]);
  });

  it('GET detail encodes id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('/admin/customers/cus_abc%2F1');
        return Response.json(
          {
            id: 'cus_abc/1',
            email: 'x@y.com',
            ordersCount: 0,
            lifetimeValueCents: 0,
            currency: 'usd',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
          { status: 200 },
        );
      }),
    );

    const row = await adminGetCustomer('cus_abc/1', { accessToken: 'tok' });
    expect(row.email).toBe('x@y.com');
  });
});
