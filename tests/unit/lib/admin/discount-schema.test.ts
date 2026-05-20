import { describe, expect, it } from 'vitest';
import { discountCreateSchema } from '@/lib/admin/discount-schema';

describe('discountCreateSchema', () => {
  it('accepts a valid percentage discount', () => {
    const result = discountCreateSchema.safeParse({
      code: 'SAVE10',
      type: 'PERCENTAGE',
      value: 10,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects percentage value outside 1..100', () => {
    const result = discountCreateSchema.safeParse({
      code: 'BADPCT',
      type: 'PERCENTAGE',
      value: 101,
      active: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires FREE_SHIPPING value to be 0', () => {
    const bad = discountCreateSchema.safeParse({
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 5,
      active: true,
    });
    expect(bad.success).toBe(false);

    const good = discountCreateSchema.safeParse({
      code: 'FREESHIP',
      type: 'FREE_SHIPPING',
      value: 0,
      active: true,
    });
    expect(good.success).toBe(true);
  });

  it('rejects invalid code characters', () => {
    const result = discountCreateSchema.safeParse({
      code: 'bad code!',
      type: 'FIXED',
      value: 500,
      active: true,
    });
    expect(result.success).toBe(false);
  });
});
