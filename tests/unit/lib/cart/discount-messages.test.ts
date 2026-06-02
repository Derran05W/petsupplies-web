import { describe, expect, it } from 'vitest';
import { discountRejectMessage } from '@/lib/cart/discount-messages';

describe('lib/cart/discount-messages', () => {
  it('maps known reject reasons', () => {
    expect(discountRejectMessage('EXPIRED')).toMatch(/expired/i);
    expect(discountRejectMessage('ALREADY_USED')).toMatch(/already used/i);
  });
});
