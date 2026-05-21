import { describe, expect, it } from 'vitest';
import { mapCatalogProduct } from '@/lib/api/product-mapper';
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
  category: 'HEALTH',
  tags: ['cat', 'treat'],
  images: [],
  inStock: true,
  avgRating: 4.5,
  reviewCount: 12,
  createdAt: '2026-05-20T20:55:11.648Z',
};

describe('mapCatalogProduct', () => {
  it('maps API price (cents) to priceCents', () => {
    const product = mapCatalogProduct(apiProduct);
    expect(product.priceCents).toBe(3799);
  });

  it('coerces string prices from API payloads', () => {
    const product = mapCatalogProduct({ ...apiProduct, price: '3799' });
    expect(product.priceCents).toBe(3799);
  });

  it('falls back to zero for invalid prices', () => {
    const product = mapCatalogProduct({ ...apiProduct, price: Number.NaN });
    expect(product.priceCents).toBe(0);
  });

  it('infers petType from tags', () => {
    expect(mapCatalogProduct(apiProduct).petType).toBe('cat');
  });

  it('maps rating aggregates', () => {
    const product = mapCatalogProduct(apiProduct);
    expect(product.rating).toEqual({ avg: 4.5, count: 12 });
  });
});
