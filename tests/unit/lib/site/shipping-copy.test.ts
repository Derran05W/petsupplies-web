import { describe, expect, it } from 'vitest';
import {
  formatFreeShippingBrandValue,
  formatFreeShippingLabel,
} from '@/lib/site/shipping-copy';

describe('formatFreeShippingLabel', () => {
  it('formats the hero / product detail shipping badge', () => {
    expect(formatFreeShippingLabel(5000)).toBe(
      'Free shipping on orders over $50.00',
    );
    expect(formatFreeShippingLabel(7500)).toBe(
      'Free shipping on orders over $75.00',
    );
  });
});

describe('formatFreeShippingBrandValue', () => {
  it('formats the brand values strip subtext', () => {
    expect(formatFreeShippingBrandValue(5000)).toBe(
      'On every order over $50.00, anywhere in the country.',
    );
  });
});
