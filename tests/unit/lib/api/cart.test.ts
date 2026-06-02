import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCartItem,
  applyCartDiscount,
  getCart,
  removeCartDiscount,
  removeCartItem,
  updateCartItem,
} from '@/lib/api/cart';
import { ApiError } from '@/lib/api/client';

describe('lib/api/cart', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET /cart with auth', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            id: 'cart_1',
            items: [],
            subtotalCents: 0,
            appliedDiscountCents: 0,
            shippingCents: 599,
            shippingDiscountCents: 0,
            totalCents: 599,
            freeShippingThresholdCents: 5000,
            freeShippingRemainingCents: 5000,
          },
          { status: 200 },
        ),
      ),
    );

    const cart = await getCart({ accessToken: 'tok' });
    expect(cart.id).toBe('cart_1');
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/cart',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('POST /cart/items', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({}, { status: 201 })),
    );

    await addCartItem('prod_1', 2, { accessToken: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/cart/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_1', quantity: 2 }),
      }),
    );
  });

  it('PATCH /cart/items/:id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({}, { status: 200 })),
    );

    await updateCartItem('item_1', 3, { accessToken: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/cart/items/item_1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ quantity: 3 }),
      }),
    );
  });

  it('DELETE /cart/items/:id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    await removeCartItem('item_1', { accessToken: 'tok' });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/cart/items/item_1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('POST /cart/discount', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            id: 'cart_1',
            items: [],
            subtotalCents: 1000,
            appliedDiscountCents: 100,
            shippingCents: 0,
            shippingDiscountCents: 0,
            totalCents: 900,
            discountCode: 'SAVE10',
            freeShippingThresholdCents: 5000,
            freeShippingRemainingCents: 4000,
          },
          { status: 200 },
        ),
      ),
    );

    const cart = await applyCartDiscount('SAVE10', { accessToken: 'tok' });
    expect(cart.discountCode).toBe('SAVE10');
  });

  it('DELETE /cart/discount and rejects invalid empty responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            id: 'cart_1',
            items: [
              {
                id: 'item_1',
                productId: 'prod_1',
                quantity: 1,
                product: {
                  id: 'prod_1',
                  name: 'Treats',
                  slug: 'treats',
                  price: 1000,
                  imageUrl: null,
                  stock: 5,
                  active: true,
                },
              },
            ],
            subtotalCents: 1000,
            appliedDiscountCents: 0,
            shippingCents: 599,
            shippingDiscountCents: 0,
            totalCents: 1599,
            freeShippingThresholdCents: 5000,
            freeShippingRemainingCents: 4000,
          },
          { status: 200 },
        ),
      ),
    );

    const cart = await removeCartDiscount({ accessToken: 'tok' });
    expect(cart.items).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/cart/discount',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('DELETE /cart/discount throws when response omits items', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    await expect(
      removeCartDiscount({ accessToken: 'tok' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
