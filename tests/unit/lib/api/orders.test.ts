import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOrders } from '@/lib/api/orders';

/** A realistic `GET /orders` wire row (Prisma-shaped, UPPERCASE status). */
function wireOrderRow() {
  return {
    id: 'ord_1',
    status: 'PAID',
    totalCents: 3399,
    subtotalCents: 2800,
    shippingCents: 599,
    taxCents: 0,
    trackingNumber: null,
    carrier: null,
    createdAt: '2026-05-01T09:14:00.000Z',
    items: [
      {
        id: 'oi_1',
        quantity: 2,
        priceCents: 1400,
        product: {
          id: 'prod_1',
          slug: 'reflective-collar',
          name: 'Reflective Collar',
          imageUrl: null,
        },
      },
    ],
  };
}

describe('getOrders', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('sends limit (not pageSize) and maps the API envelope + wire rows', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        data: [wireOrderRow()],
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
      status: 'paid',
      accessToken: 'tok',
    });

    // status is uppercased for the backend validator.
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/orders?page=2&limit=10&status=PAID',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.orders).toHaveLength(1);

    const order = result.orders[0]!;
    // Wire → app translation: lowercase status, items → lines, priceCents →
    // unitPriceCents, computed lineTotalCents, defaulted currency, null image → ''.
    expect(order.id).toBe('ord_1');
    expect(order.status).toBe('paid');
    expect(order.currency).toBe('cad');
    expect(order.email).toBeUndefined();
    expect(order.checkoutSessionId).toBeUndefined();
    expect(order.lines).toEqual([
      {
        id: 'oi_1',
        productId: 'prod_1',
        slug: 'reflective-collar',
        name: 'Reflective Collar',
        imageUrl: '',
        quantity: 2,
        unitPriceCents: 1400,
        lineTotalCents: 2800,
      },
    ]);
  });
});
