import { describe, expect, it } from 'vitest';
import {
  mapApiOrder,
  mapApiOrderListItem,
  type ApiOrderDetail,
  type ApiOrderListItem,
} from '@/lib/api/order-mapper';

function detailRow(): ApiOrderDetail {
  return {
    id: 'ord_9',
    status: 'SHIPPED',
    totalCents: 7200,
    subtotalCents: 7200,
    shippingCents: 0,
    taxCents: 0,
    trackingNumber: 'TRK123',
    carrier: 'CANADA_POST',
    createdAt: '2026-04-22T15:42:00.000Z',
    items: [
      {
        id: 'oi_9',
        quantity: 1,
        priceCents: 4800,
        product: {
          id: 'prod_kibble',
          slug: 'wholesome-kibble',
          name: 'Wholesome Kibble',
          imageUrl: 'https://img/kibble.jpg',
        },
      },
    ],
    shipName: 'Jane Smith',
    shipLine1: '123 Maple Street',
    shipLine2: 'Apt 4B',
    shipCity: 'Brooklyn',
    shipRegion: 'NY',
    shipPostalCode: '11201',
    shipCountry: 'US',
  };
}

describe('mapApiOrder', () => {
  it('nests flat ship* columns into shippingAddress and lowercases status', () => {
    const order = mapApiOrder(detailRow());

    expect(order.status).toBe('shipped');
    expect(order.trackingNumber).toBe('TRK123');
    expect(order.shippingAddress).toEqual({
      fullName: 'Jane Smith',
      line1: '123 Maple Street',
      line2: 'Apt 4B',
      city: 'Brooklyn',
      state: 'NY',
      postalCode: '11201',
      country: 'US',
    });
    expect(order.currency).toBe('cad');
    expect(order.email).toBeUndefined();
    expect(order.checkoutSessionId).toBeUndefined();
  });

  it('omits line2 when the wire column is null', () => {
    const order = mapApiOrder({ ...detailRow(), shipLine2: null });
    expect('line2' in order.shippingAddress).toBe(false);
  });

  it('drops trackingNumber when absent', () => {
    const order = mapApiOrder({ ...detailRow(), trackingNumber: null });
    expect(order.trackingNumber).toBeUndefined();
  });
});

describe('mapApiOrderListItem', () => {
  it('produces an empty shipping address (list wire omits it)', () => {
    const listRow: ApiOrderListItem = {
      id: 'ord_l',
      status: 'PENDING',
      totalCents: 100,
      subtotalCents: 100,
      shippingCents: 0,
      taxCents: 0,
      trackingNumber: null,
      carrier: null,
      createdAt: '2026-05-01T00:00:00.000Z',
      items: [],
    };

    const order = mapApiOrderListItem(listRow);
    expect(order.status).toBe('pending');
    expect(order.shippingAddress).toEqual({
      fullName: '',
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
    expect(order.lines).toEqual([]);
  });
});
