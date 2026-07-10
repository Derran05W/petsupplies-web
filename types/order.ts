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
  /**
   * Stripe Checkout Session ID. Optional: the backend user-order selects
   * don't return `stripeSessionId`, so the mapper omits it; the success-page
   * poll stitches it back in from the redirect URL.
   */
  checkoutSessionId?: string;
  status: OrderStatus;
  /**
   * Customer email. Optional: the backend user-order wire omits it (email
   * lives on the related `User` model, not `Order`), so the mapper omits it.
   * Callers must render it conditionally.
   */
  email?: string;
  shippingAddress: ShippingAddress;
  lines: OrderLine[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
  /**
   * Carrier-agnostic tracking number, set by the backend when the order
   * has been shipped (Phase 8 admin order endpoints write this). Optional
   * because Phase 6 callers populated `OrderSummary` immediately after
   * checkout, before any tracking exists.
   */
  trackingNumber?: string;
  /** Optional URL to the carrier's tracking page. */
  trackingUrl?: string;
}
