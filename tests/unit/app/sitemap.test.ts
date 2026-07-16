import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product, ProductListResponse } from '@/types/product';

const getProducts = vi.fn();
vi.mock('@/lib/api/products', () => ({
  getProducts: (...args: unknown[]) => getProducts(...args),
}));

function makeProduct(slug: string): Product {
  return {
    id: slug,
    slug,
    name: slug,
    description: '',
    priceCents: 1000,
    category: 'food',
    petType: 'dog',
    images: [],
    inStock: true,
    stockCount: 5,
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function listResponse(products: Product[]): ProductListResponse {
  return {
    products,
    total: products.length,
    page: 1,
    pageSize: products.length,
    totalPages: 1,
  };
}

describe('app/sitemap', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shop.example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('includes home, products, cart, and every static CMS slug', async () => {
    getProducts.mockResolvedValue(listResponse([]));
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://shop.example.com/');
    expect(urls).toContain('https://shop.example.com/products');
    expect(urls).toContain('https://shop.example.com/cart');
    expect(urls).toContain('https://shop.example.com/about');
    expect(urls).toContain('https://shop.example.com/faq');
  });

  it('pages at the backend 100-row limit and caps product URLs at 200', async () => {
    const pageOf = (start: number) =>
      Array.from({ length: 100 }, (_, i) => makeProduct(`p-${start + i}`));
    getProducts
      .mockResolvedValueOnce({ ...listResponse(pageOf(0)), totalPages: 3 })
      .mockResolvedValueOnce({ ...listResponse(pageOf(100)), totalPages: 3 });
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const productUrls = entries.filter((e) => e.url.includes('/products/p-'));

    // The API clamps limit to 100, so the cap is reached via paged fetches —
    // and the third page past the cap is never requested.
    expect(getProducts).toHaveBeenCalledTimes(2);
    expect(getProducts).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 100 });
    expect(getProducts).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 100 });
    expect(productUrls).toHaveLength(200);
    expect(productUrls[0]?.url).toBe('https://shop.example.com/products/p-0');
  });

  it('still yields static entries when the API is unreachable', async () => {
    getProducts.mockRejectedValue(new Error('network down'));
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain('https://shop.example.com/');
    expect(urls).toContain('https://shop.example.com/products');
    expect(urls.some((u) => u.includes('/products/'))).toBe(false);
  });
});
