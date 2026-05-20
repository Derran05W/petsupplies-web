import { formatPrice } from '@/lib/utils/format';

/** Hero badge / product detail — "Free shipping on orders over $X". */
export function formatFreeShippingLabel(thresholdCents: number): string {
  return `Free shipping on orders over ${formatPrice(thresholdCents)}`;
}

/** Brand values strip — "On every order over $X, anywhere…". */
export function formatFreeShippingBrandValue(thresholdCents: number): string {
  return `On every order over ${formatPrice(thresholdCents)}, anywhere in the country.`;
}
