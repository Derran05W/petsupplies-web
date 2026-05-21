import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});

import { mapFeaturedProductsResponse } from '@/lib/api/site/featured-products';
import type { ApiCatalogProduct } from '@/lib/api/product-mapper';

const apiProduct: ApiCatalogProduct = {
  id: 'prod-1',
  slug: 'cat-cocktail',
  name: 'Cat cocktail',
  description: 'Cats gotta drink too',
  price: 3799,
  imageUrl: null,
  stock: 150,
  active: true,
  category: 'CAT',
  tags: ['cat', 'treat'],
  images: [],
  inStock: true,
  avgRating: 4.5,
  reviewCount: 12,
  createdAt: '2026-05-20T20:55:11.648Z',
};

describe('mapFeaturedProductsResponse', () => {
  it('maps API catalog rows to storefront products with priceCents', () => {
    const [product] = mapFeaturedProductsResponse([apiProduct]);
    expect(product?.priceCents).toBe(3799);
    expect(product?.name).toBe('Cat cocktail');
  });

  it('returns an empty array for non-array payloads', () => {
    expect(mapFeaturedProductsResponse(null)).toEqual([]);
  });

  it('unwraps `{ products: [...] }` payloads', () => {
    const [product] = mapFeaturedProductsResponse({ products: [apiProduct] });
    expect(product?.priceCents).toBe(3799);
  });
});
