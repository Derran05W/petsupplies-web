import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminGetOrder,
  adminListOrders,
  adminUpdateOrder,
  patchOrderTracking,
} from '@/lib/api/admin/orders';

/** A full `getAdminOrder` wire row (also what PATCH /status echoes). */
function detailWire(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ord_1',
    status: 'SHIPPED',
    totalCents: 5000,
    subtotalCents: 4000,
    shippingCents: 500,
    taxCents: 500,
    trackingNumber: 'TRK1',
    carrier: 'UPS',
    shippedAt: '2026-01-02T00:00:00.000Z',
    shipName: 'Jane Doe',
    shipLine1: '1 St',
    shipLine2: null,
    shipCity: 'Town',
    shipRegion: 'ON',
    shipPostalCode: 'A1A1A1',
    shipCountry: 'CA',
    createdAt: '2026-01-01T00:00:00.000Z',
    items: [
      {
        id: 'it1',
        quantity: 2,
        priceCents: 2000,
        product: { id: 'p1', slug: 'kibble', name: 'Kibble', imageUrl: null },
      },
    ],
    user: { id: 'usr_1', email: 'jane@x.com', name: 'Jane Doe' },
    ...overrides,
  };
}

describe('lib/api/admin/orders', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('adminUpdateOrder', () => {
    it('PATCHes /status with the UPPERCASE enum + tracking + carrier when shipping', async () => {
      let captured: { url: string; init: RequestInit } | null = null;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string | URL, init: RequestInit) => {
          captured = { url: String(url), init };
          return Response.json(detailWire(), { status: 200 });
        }),
      );

      const res = await adminUpdateOrder(
        'ord_1',
        { status: 'shipped', trackingNumber: 'TRK1', carrier: 'UPS' },
        { accessToken: 't' },
      );

      expect(captured!.url).toContain('/admin/orders/ord_1/status');
      expect(captured!.init.method).toBe('PATCH');
      expect(JSON.parse(captured!.init.body as string)).toEqual({
        status: 'SHIPPED',
        trackingNumber: 'TRK1',
        carrier: 'UPS',
      });

      // Response mapped through the admin detail mapping → app shape.
      expect(res.status).toBe('shipped');
      expect(res.carrier).toBe('UPS');
      expect(res.trackingNumber).toBe('TRK1');
      expect(res.totalCents).toBe(5000);
      expect(res.lines[0]?.unitPriceCents).toBe(2000);
      expect(res.shippingAddress.fullName).toBe('Jane Doe');
      expect(res.shippingAddress.country).toBe('CA');
      expect(res.customerEmail).toBe('jane@x.com');
      expect(res.customerId).toBe('usr_1');
    });

    it('omits tracking/carrier for non-shipped transitions', async () => {
      let body: unknown = null;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (_url: string | URL, init: RequestInit) => {
          body = JSON.parse(init.body as string);
          return Response.json(
            detailWire({
              status: 'CANCELLED',
              trackingNumber: null,
              carrier: null,
            }),
            { status: 200 },
          );
        }),
      );

      const res = await adminUpdateOrder('ord_1', { status: 'cancelled' });
      expect(body).toEqual({ status: 'CANCELLED' });
      expect(res.status).toBe('cancelled');
    });
  });

  describe('patchOrderTracking', () => {
    it('PATCHes /tracking with { trackingNumber, carrier } (drops trackingUrl) and maps the partial echo', async () => {
      let captured: { url: string; init: RequestInit } | null = null;
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string | URL, init: RequestInit) => {
          captured = { url: String(url), init };
          return Response.json(
            {
              id: 'ord_1',
              status: 'SHIPPED',
              trackingNumber: 'TRK2',
              carrier: 'FedEx',
              shippedAt: '2026-01-02T00:00:00.000Z',
              createdAt: '2026-01-01T00:00:00.000Z',
              user: { id: 'usr_1', email: 'jane@x.com', name: 'Jane Doe' },
            },
            { status: 200 },
          );
        }),
      );

      const res = await patchOrderTracking('ord_1', {
        trackingNumber: 'TRK2',
        carrier: 'FedEx',
        trackingUrl: 'https://carrier.example.com/track/TRK2',
      });

      expect(captured!.url).toContain('/admin/orders/ord_1/tracking');
      expect(captured!.init.method).toBe('PATCH');
      // carrier is REQUIRED; trackingUrl has no backend column and is dropped.
      expect(JSON.parse(captured!.init.body as string)).toEqual({
        trackingNumber: 'TRK2',
        carrier: 'FedEx',
      });

      expect(res).toEqual({
        id: 'ord_1',
        status: 'shipped',
        trackingNumber: 'TRK2',
        carrier: 'FedEx',
      });
    });
  });

  describe('adminGetOrder', () => {
    it('GETs /admin/orders/:id and maps ship* → shippingAddress + user → customer fields', async () => {
      let capturedUrl = '';
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string | URL, init: RequestInit) => {
          capturedUrl = String(url);
          expect(init.method ?? 'GET').toBe('GET');
          return Response.json(detailWire({ status: 'PAID' }), { status: 200 });
        }),
      );

      const res = await adminGetOrder('ord_1', { accessToken: 't' });
      expect(capturedUrl).toContain('/admin/orders/ord_1');
      expect(capturedUrl).not.toContain('/status');
      expect(res.status).toBe('paid');
      expect(res.shippingAddress.line1).toBe('1 St');
      expect(res.shippingAddress.state).toBe('ON');
      expect(res.shippingAddress.postalCode).toBe('A1A1A1');
      expect(res.customerEmail).toBe('jane@x.com');
      expect(res.customerId).toBe('usr_1');
      expect(res.carrier).toBe('UPS');
    });
  });

  describe('adminListOrders', () => {
    function stubListFetch(): { seen: () => string } {
      let url = '';
      vi.stubGlobal(
        'fetch',
        vi.fn(async (u: string | URL) => {
          url = String(u);
          return Response.json(
            { data: [], page: 1, limit: 20, total: 0, totalPages: 0 },
            { status: 200 },
          );
        }),
      );
      return { seen: () => url };
    }

    it('forwards valid statuses as the UPPERCASE enum', async () => {
      const f = stubListFetch();
      await adminListOrders({ status: 'shipped' });
      expect(f.seen()).toContain('status=SHIPPED');
      expect(f.seen()).toContain('limit=20');
    });

    it('drops app-only statuses the backend enum rejects (delivered/refunded)', async () => {
      const f = stubListFetch();
      await adminListOrders({ status: 'delivered' });
      expect(f.seen()).not.toContain('status=');
    });
  });
});
