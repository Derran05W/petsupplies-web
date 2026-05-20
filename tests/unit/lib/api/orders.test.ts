import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOrders } from '@/lib/api/orders';

describe('getOrders', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends limit (not pageSize) and maps the API envelope', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        data: [{ id: 'ord_1' }],
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getOrders({
      page: 2,
      limit: 10,
      accessToken: 'tok',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/orders?page=2&limit=10',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
    expect(result).toEqual({
      orders: [{ id: 'ord_1' }],
      page: 2,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
