import { describe, expect, it } from 'vitest';
import {
  mapApiProduct,
  toCreateBody,
  filterByStockState,
} from '@/lib/api/admin/product-mapper';
import type { ApiAdminProduct } from '@/types/admin-product-api';

const apiProduct: ApiAdminProduct = {
  id: 'prod-1',
  slug: 'salmon-treats',
  name: 'Salmon Treats',
  description: 'Tasty',
  price: 1299,
  stock: 3,
  active: true,
  category: 'DOG',
  tags: ['treat'],
  imageUrl: null,
  images: [
    {
      id: 'img-1',
      productId: 'prod-1',
      url: 'https://cdn.example.com/a.jpg',
      altText: 'Bag',
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  weightGrams: null,
  lengthCm: null,
  widthCm: null,
  heightCm: null,
  shipsSeparately: false,
  subscriptionEligible: false,
  avgRating: null,
  reviewCount: 0,
};

describe('admin product mapper', () => {
  it('maps API product fields to AdminProduct', () => {
    const mapped = mapApiProduct(apiProduct);
    expect(mapped.priceCents).toBe(1299);
    expect(mapped.stockCount).toBe(3);
    expect(mapped.isPublished).toBe(true);
    expect(mapped.category).toBe('DOG');
    expect(mapped.images[0]?.alt).toBe('Bag');
  });

  it('builds create body with backend field names', () => {
    const body = toCreateBody({
      name: 'Salmon Treats',
      slug: 'salmon-treats',
      description: 'Tasty',
      priceCents: 1299,
      category: 'DOG',
      images: apiProduct.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: 'Bag',
        isPrimary: true,
      })),
      stockCount: 3,
      tags: ['treat'],
      isPublished: true,
    });
    expect(body).toMatchObject({
      price: 1299,
      stock: 3,
      active: true,
      category: 'DOG',
      imageUrl: 'https://cdn.example.com/a.jpg',
    });
  });

  it('filters low stock client-side', () => {
    const products = [
      mapApiProduct({ ...apiProduct, id: 'a', stock: 0 }),
      mapApiProduct({ ...apiProduct, id: 'b', stock: 2 }),
      mapApiProduct({ ...apiProduct, id: 'c', stock: 50 }),
    ];
    const low = filterByStockState(products, 'low');
    expect(low.map((p) => p.id)).toEqual(['b']);
  });
});
