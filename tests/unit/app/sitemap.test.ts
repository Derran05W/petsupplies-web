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

  it('adds product detail URLs and caps at 200', async () => {
    const many = Array.from({ length: 250 }, (_, i) => makeProduct(`p-${i}`));
    getProducts.mockResolvedValue(listResponse(many));
    const { default: sitemap } = await import('@/app/sitemap');
    const entries = await sitemap();
    const productUrls = entries.filter((e) => e.url.includes('/products/p-'));

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
