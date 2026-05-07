/**
 * Order types — mirrors the petsupplies-api Phase 7 response shape.
 *
 * Phase 6 only consumes `OrderSummary` (post-checkout success page) and
 * `ShippingAddress` (collected on the checkout form). The full account
 * order list / detail pages arrive in Phase 7 and will reuse these
 * interfaces verbatim.
 */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/** ISO-3166-1 alpha-2 country code (e.g. `US`, `CA`, `GB`). */
export type CountryCode = string;

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: CountryCode;
}

export interface OrderLine {
  id: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderSummary {
  id: string;
  /** Stripe Checkout Session ID — used by the success page poll. */
  checkoutSessionId: string;
  status: OrderStatus;
  email: string;
  shippingAddress: ShippingAddress;
  lines: OrderLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
}
