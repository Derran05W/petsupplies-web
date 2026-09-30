import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminFulfillmentQueue,
  adminBulkShip,
} from '@/lib/api/admin/fulfillment';

describe('lib/api/admin/fulfillment', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET queue sends limit + UPPERCASE status and maps the wire envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        const s = String(url);
        expect(s).toContain('limit=20');
        expect(s).toContain('status=PAID');
        // Backend returns a { data, page, limit, total, totalPages } envelope.
        return Response.json(
          {
            data: [
              {
                id: 'ord_1',
                status: 'PAID',
                totalCents: 4200,
                trackingNumber: null,
                carrier: null,
                shippedAt: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                shipName: 'Jane Doe',
                shipLine1: '1 St',
                shipCity: 'Town',
                shipRegion: 'ON',
                shipPostalCode: 'A1A1A1',
                shipCountry: 'CA',
                user: { id: 'usr_1', email: 'jane@x.com', name: 'Jane Doe' },
              },
            ],
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
          },
          { status: 200 },
        );
      }),
    );

    const res = await adminFulfillmentQueue({
      status: 'paid',
      accessToken: 't',
    });
    expect(res.pageSize).toBe(20);
    expect(res.orders).toHaveLength(1);
    expect(res.orders[0]?.status).toBe('paid');
    expect(res.orders[0]?.customerEmail).toBe('jane@x.com');
    expect(res.orders[0]?.totalCents).toBe(4200);
  });

  it('POST bulk-ship fans orderIds into items and maps results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init) => {
        expect(init).toMatchObject({
          method: 'POST',
          body: JSON.stringify({
            items: [
              { orderId: 'a', trackingNumber: 'T1', carrier: 'ups' },
              { orderId: 'b', trackingNumber: 'T1', carrier: 'ups' },
            ],
          }),
        });
        return Response.json(
          {
            results: [
              { orderId: 'a', ok: true, status: 'SHIPPED' },
              { orderId: 'b', ok: false, error: 'Invalid transition' },
            ],
          },
          { status: 200 },
        );
      }),
    );

    const res = await adminBulkShip(
      { orderIds: ['a', 'b'], trackingNumber: 'T1', carrier: 'ups' },
      { accessToken: 't' },
    );
    expect(res.updated).toEqual([{ id: 'a', status: 'shipped' }]);
    expect(res.failed).toEqual([
      { orderId: 'b', message: 'Invalid transition' },
    ]);
  });

  it('POST bulk-ship rejects (without hitting the network) when carrier is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    // Backend `bulkShipSchema` requires a non-empty trackingNumber AND carrier.
    await expect(
      adminBulkShip({ orderIds: ['a'], trackingNumber: 'T1' }),
    ).rejects.toThrow(/carrier/i);
    await expect(
      adminBulkShip({ orderIds: ['a'], carrier: 'ups' }),
    ).rejects.toThrow(/tracking number/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
