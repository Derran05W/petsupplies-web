import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { getOrders, getSharedOrder } from '@/lib/api/orders';

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

/** A realistic `GET /orders/:id` detail wire row (adds the flat ship* columns). */
function wireOrderDetail() {
  return {
    ...wireOrderRow(),
    discountCents: 0,
    discountCode: null,
    shipName: 'Jane Smith',
    shipLine1: '123 Maple Street',
    shipLine2: null,
    shipCity: 'Toronto',
    shipRegion: 'ON',
    shipPostalCode: 'M5V 2T6',
    shipCountry: 'CA',
  };
}

describe('getSharedOrder', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('maps the detail row on success and passes the token', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(wireOrderDetail(), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const order = await getSharedOrder('ord_1', 'signed-token');

    expect(order?.id).toBe('ord_1');
    expect(order?.status).toBe('paid');
    expect(order?.shippingAddress.fullName).toBe('Jane Smith');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/orders/ord_1/shared?token=signed-token',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  // The backend guards every `/orders/*` route with auth middleware that runs
  // BEFORE routing, so a token-only request answers 401/403 (not 404) for this
  // not-yet-public route. All of 401/403/404 must degrade to `null` so the
  // public email page renders its graceful notFound() state instead of crashing.
  it.each([401, 403, 404])(
    'returns null on HTTP %i (graceful missing state)',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => Response.json({ message: 'nope' }, { status })),
      );

      await expect(getSharedOrder('ord_1', 'tok')).resolves.toBeNull();
    },
  );

  it('rethrows other failures (e.g. 500) as ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'boom' }, { status: 500 })),
    );

    await expect(getSharedOrder('ord_1', 'tok')).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
