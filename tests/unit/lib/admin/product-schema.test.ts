import { describe, expect, it } from 'vitest';
import { productSchema } from '@/lib/admin/schemas';
import { toUpdateBody } from '@/lib/api/admin/product-mapper';
import type { AdminProductInput } from '@/types/admin';

const baseInput: AdminProductInput = {
  name: 'New Name',
  slug: 'salmon-treats',
  description: 'Tasty',
  priceCents: 1299,
  category: 'DOG',
  images: [
    {
      id: 'img-1',
      url: 'https://cdn.example.com/a.jpg',
      alt: 'Bag',
      isPrimary: true,
    },
  ],
  stockCount: 3,
  tags: ['treat'],
  isPublished: true,
};

describe('productSchema', () => {
  it('accepts a typical edit payload', () => {
    expect(productSchema.safeParse(baseInput).success).toBe(true);
  });

  it('rejects relative image URLs', () => {
    const result = productSchema.safeParse({
      ...baseInput,
      images: [{ ...baseInput.images[0]!, url: '/uploads/a.jpg' }],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/url/i);
  });
});

describe('toUpdateBody', () => {
  it('sends integer price and stock', () => {
    const body = toUpdateBody({
      ...baseInput,
      priceCents: 1299.7,
      stockCount: 3.9,
    });
    expect(body.price).toBe(1299);
    expect(body.stock).toBe(3);
    expect(Number.isInteger(body.price)).toBe(true);
    expect(Number.isInteger(body.stock)).toBe(true);
  });

  it('omits invalid imageUrl instead of sending a relative path', () => {
    const body = toUpdateBody({
      ...baseInput,
      images: [{ ...baseInput.images[0]!, url: '/relative.jpg' }],
    });
    expect(body.imageUrl).toBeUndefined();
  });

  it('JSON.stringify never turns price into null', () => {
    const body = toUpdateBody(baseInput);
    const json = JSON.stringify(body) as string;
    expect(json).not.toContain('"price":null');
  });
});
