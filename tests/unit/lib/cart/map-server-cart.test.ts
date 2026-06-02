import { describe, expect, it } from 'vitest';
import { mapApiCartItemToViewLine } from '@/lib/cart/map-server-cart';

describe('lib/cart/map-server-cart', () => {
  it('maps API cart item to view line', () => {
    const line = mapApiCartItemToViewLine({
      id: 'ci_1',
      productId: 'p1',
      quantity: 2,
      product: {
        id: 'p1',
        name: 'Kibble',
        slug: 'kibble',
        price: 1999,
        imageUrl: 'https://example.com/img.jpg',
        stock: 10,
        active: true,
      },
    });

    expect(line.cartItemId).toBe('ci_1');
    expect(line.productId).toBe('p1');
    expect(line.priceCents).toBe(1999);
    expect(line.quantity).toBe(2);
  });
});
