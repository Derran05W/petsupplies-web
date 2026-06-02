import type { ServerCart } from '@/types/cart';

/** Optimistic server-cart shape after discount removal (refetch corrects shipping). */
export function stripDiscountFromServerCart(cart: ServerCart): ServerCart {
  const {
    discountCode: _code,
    discountType: _type,
    discountValue: _value,
    discountInvalidReason: _reason,
    discountInvalidCode: _invalidCode,
    ...rest
  } = cart;

  return {
    ...rest,
    appliedDiscountCents: 0,
    shippingDiscountCents: 0,
    totalCents: cart.subtotalCents + cart.shippingCents,
  };
}
