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

  it('GET queue passes status when set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL) => {
        expect(String(url)).toContain('status=paid');
        return Response.json(
          {
            orders: [],
            total: 0,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
          { status: 200 },
        );
      }),
    );

    await adminFulfillmentQueue({ status: 'paid', accessToken: 't' });
  });

  it('POST bulk-ship JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, init) => {
        expect(init).toMatchObject({
          method: 'POST',
          body: JSON.stringify({
            orderIds: ['a', 'b'],
            trackingNumber: 'T1',
          }),
        });
        return Response.json({ updated: [], failed: [] }, { status: 200 });
      }),
    );

    const res = await adminBulkShip(
      { orderIds: ['a', 'b'], trackingNumber: 'T1' },
      { accessToken: 't' },
    );
    expect(res.failed).toEqual([]);
  });
});
