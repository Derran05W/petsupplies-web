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

  it('maps a null/absent ingredients field to undefined', () => {
    expect(mapCatalogProduct(apiProduct).ingredients).toBeUndefined();
    expect(
      mapCatalogProduct({ ...apiProduct, ingredients: null }).ingredients,
    ).toBeUndefined();
    expect(
      mapCatalogProduct({ ...apiProduct, ingredients: '   ' }).ingredients,
    ).toBeUndefined();
  });

  it('passes through a populated ingredients field', () => {
    const product = mapCatalogProduct({
      ...apiProduct,
      ingredients: 'Salmon, sweet potato, peas',
    });
    expect(product.ingredients).toBe('Salmon, sweet potato, peas');
  });

  it('falls back to the single inferred category when wire array is missing', () => {
    const product = mapCatalogProduct(apiProduct);
    // tags include "treat" so inference wins over the HEALTH api category.
    expect(product.categories).toEqual(['treats']);
    expect(product.category).toBe('treats');
  });

  it('maps and dedupes the wire categories array through inference', () => {
    const product = mapCatalogProduct({
      ...apiProduct,
      tags: [],
      category: 'DOG',
      categories: ['DOG', 'CAT', 'ACCESSORIES'],
    });
    // DOG + CAT both infer to "food" and dedupe; ACCESSORIES stays distinct.
    expect(product.categories).toEqual(['food', 'accessories']);
    expect(product.category).toBe('food');
  });
});
