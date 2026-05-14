import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  addWishlistItem,
  listWishlist,
  removeWishlistItem,
} from '@/lib/api/wishlist';
import { sampleWishlistItem } from '@/tests/fixtures/wishlist';

describe('lib/api/wishlist', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('GET normalises a bare array payload', async () => {
    const item = sampleWishlistItem();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json([item], { status: 200 })),
    );

    const rows = await listWishlist({ accessToken: 'tok' });
    expect(rows).toEqual([item]);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/wishlist',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer tok',
        }),
      }),
    );
  });

  it('GET normalises an object with items[]', async () => {
    const item = sampleWishlistItem();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ items: [item], meta: {} }, { status: 200 }),
      ),
    );

    const rows = await listWishlist({ accessToken: 'tok' });
    expect(rows).toEqual([item]);
  });

  it('GET returns [] on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(listWishlist({ accessToken: 'tok' })).resolves.toEqual([]);
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

  it('POST returns payload on 201', async () => {
    const item = sampleWishlistItem();
    const product = item.product;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(item, { status: 201 })),
    );

    const result = await addWishlistItem(product.id, {
      accessToken: 'tok',
      product,
    });
    expect(result).toEqual(item);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      'http://localhost:3001/users/me/wishlist',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ productId: product.id }),
      }),
    );
  });

  it('POST treats 409 as success when product snapshot is provided', async () => {
    const item = sampleWishlistItem();
    const product = item.product;
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

  it('POST synthesises on network error when product snapshot exists', async () => {
    const item = sampleWishlistItem();
    const product = item.product;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    const result = await addWishlistItem(product.id, {
      accessToken: 'tok',
      product,
    });
    expect(result.product).toEqual(product);
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

  it('DELETE no-ops on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );

    await expect(
      removeWishlistItem('prod-1', { accessToken: 'tok' }),
    ).resolves.toBeUndefined();
  });
});
