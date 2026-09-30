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
    discountCents: 0,
    discountCode: null,
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
    // No discount on the wire (discountCents 0) → both fields omitted.
    expect(order.discountCents).toBeUndefined();
    expect(order.discountCode).toBeUndefined();
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

describe('discount mapping', () => {
  it('maps discountCents and discountCode when a code was applied', () => {
    const order = mapApiOrder({
      ...detailRow(),
      discountCents: 1000,
      discountCode: 'WELCOME10',
    });
    expect(order.discountCents).toBe(1000);
    expect(order.discountCode).toBe('WELCOME10');
  });

  it('maps discountCents but omits discountCode for a codeless discount', () => {
    const order = mapApiOrder({
      ...detailRow(),
      discountCents: 500,
      discountCode: null,
    });
    expect(order.discountCents).toBe(500);
    expect(order.discountCode).toBeUndefined();
  });

  it('omits the discount fields entirely when discountCents is 0', () => {
    const order = mapApiOrder({
      ...detailRow(),
      discountCents: 0,
      discountCode: 'STALE',
    });
    expect(order.discountCents).toBeUndefined();
    expect(order.discountCode).toBeUndefined();
  });
});

describe('line-item image filtering', () => {
  function rowWithImage(imageUrl: string | null): ApiOrderDetail {
    const base = detailRow();
    return {
      ...base,
      items: base.items.map((item) => ({
        ...item,
        product: { ...item.product, imageUrl },
      })),
    };
  }

  it('passes a servable raster URL through untouched', () => {
    const order = mapApiOrder(
      rowWithImage('https://cdn.example.com/kibble.jpg'),
    );
    expect(order.lines[0]?.imageUrl).toBe('https://cdn.example.com/kibble.jpg');
  });

  it('drops a placehold.co SVG URL to the empty-string fallback sentinel', () => {
    const order = mapApiOrder(rowWithImage('https://placehold.co/600x600'));
    expect(order.lines[0]?.imageUrl).toBe('');
  });

  it('drops an explicit .svg URL to the empty-string fallback sentinel', () => {
    const order = mapApiOrder(rowWithImage('https://cdn.example.com/icon.svg'));
    expect(order.lines[0]?.imageUrl).toBe('');
  });

  it('maps a null product image to the empty-string fallback sentinel', () => {
    const order = mapApiOrder(rowWithImage(null));
    expect(order.lines[0]?.imageUrl).toBe('');
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
      discountCents: 0,
      discountCode: null,
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
