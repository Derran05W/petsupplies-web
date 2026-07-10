import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  addWishlistItem,
  listWishlist,
  removeWishlistItem,
} from '@/lib/api/wishlist';
import {
  sampleWishlistApiEnvelope,
  sampleWishlistApiItem,
} from '@/tests/fixtures/wishlist';
import { oneFeaturedProduct } from '@/tests/fixtures/products';

describe('lib/api/wishlist', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET unwraps the { data: [...] } envelope and maps the product snapshot', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(sampleWishlistApiEnvelope(), { status: 200 }),
      ),
    );

    const rows = await listWishlist({ accessToken: 'tok' });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.product.id).toBe('prod-1');
    expect(rows[0]!.product.priceCents).toBe(1299);
    expect(rows[0]!.product.inStock).toBe(true);
    expect(rows[0]!.product.images[0]!.url).toBe('https://cdn.test/salmon.jpg');
    expect(rows[0]!.addedAt).toBe('2026-02-01T12:00:00.000Z');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/wishlist',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET maps a bare array payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json([sampleWishlistApiItem()], { status: 200 }),
      ),
    );

    const rows = await listWishlist({ accessToken: 'tok' });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.product.slug).toBe('salmon-feast');
  });

  it('GET throws on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(listWishlist({ accessToken: 'tok' })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it('GET rethrows non-network ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'no' }, { status: 401 })),
    );

    await expect(listWishlist({ accessToken: 'bad' })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it('POST returns the row on 201, preferring the caller product snapshot', async () => {
    const product = oneFeaturedProduct();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(sampleWishlistApiItem(), { status: 201 }),
      ),
    );

    const result = await addWishlistItem(product.id, {
      accessToken: 'tok',
      product,
    });
    expect(result.product).toEqual(product);
    expect(result.addedAt).toBe('2026-02-01T12:00:00.000Z');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/wishlist',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      }),
    );
  });

  it('POST treats 409 as success when product snapshot is provided', async () => {
    const product = oneFeaturedProduct();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'exists' }, { status: 409 })),
    );

    const result = await addWishlistItem(product.id, {
      accessToken: 'tok',
      product,
    });
    expect(result.product).toEqual(product);
    expect(result.addedAt).toBeDefined();
  });

  it('POST throws on network error', async () => {
    const product = oneFeaturedProduct();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      addWishlistItem(product.id, { accessToken: 'tok', product }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('DELETE succeeds on 204', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    await expect(
      removeWishlistItem('prod-1', { accessToken: 'tok' }),
    ).resolves.toBeUndefined();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/wishlist/prod-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('DELETE swallows 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ message: 'missing' }, { status: 404 })),
    );

    await expect(
      removeWishlistItem('nope', { accessToken: 'tok' }),
    ).resolves.toBeUndefined();
  });

  it('DELETE throws on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      removeWishlistItem('prod-1', { accessToken: 'tok' }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
