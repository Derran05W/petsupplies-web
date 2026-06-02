import { describe, expect, it } from 'vitest';
import { stripDiscountFromServerCart } from '@/lib/cart/strip-discount';
import type { ServerCart } from '@/types/cart';

const baseCart: ServerCart = {
  id: 'cart_1',
  items: [
    {
      id: 'item_1',
      productId: 'prod_1',
      quantity: 2,
      product: {
        id: 'prod_1',
        name: 'Treats',
        slug: 'treats',
        price: 1500,
        imageUrl: null,
        stock: 10,
        active: true,
      },
    },
  ],
  subtotalCents: 3000,
  appliedDiscountCents: 300,
  shippingCents: 599,
  shippingDiscountCents: 0,
  totalCents: 3299,
  discountCode: 'SAVE10',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  freeShippingThresholdCents: 5000,
  freeShippingRemainingCents: 2000,
};

describe('lib/cart/strip-discount', () => {
  it('clears discount fields but keeps line items', () => {
    const next = stripDiscountFromServerCart(baseCart);

    expect(next.items).toHaveLength(1);
    expect(next.items[0]?.productId).toBe('prod_1');
    expect(next.appliedDiscountCents).toBe(0);
    expect(next.discountCode).toBeUndefined();
    expect(next.totalCents).toBe(3599);
  });
});
