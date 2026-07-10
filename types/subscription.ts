/**
 * Subscribe & Save — mirrors petsupplies-api subscription resources.
 * See docs/backend-api-routes.md § Subscriptions.
 */

export type SubscriptionInterval =
  | '2_weeks'
  | '4_weeks'
  | '8_weeks'
  | '12_weeks';

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'canceled'
  | 'past_due'
  | 'incomplete';

export interface ProductSubscriptionInfo {
  enabled: boolean;
  intervals: SubscriptionInterval[];
  /** Integer percent deducted from one-time unit price for UI preview only. */
  discountPercent: number;
}

export interface Subscription {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  interval: SubscriptionInterval;
  unitPriceCents: number;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  /** ISO8601 — next renewal or subscription end date. */
  currentPeriodEnd: string;
  petId?: string | null;
  createdAt: string;
}

/**
 * Body accepted by the backend `POST /subscriptions` validator. It is
 * `.strict()` — only these four fields are permitted. Success / cancel URLs
 * are configured server-side on the Stripe Checkout session, so the frontend
 * does not send them; it redirects to the `url` in the response.
 */
export interface CreateSubscriptionCheckoutRequest {
  productId: string;
  quantity: number;
  interval: SubscriptionInterval;
  petId?: string | null;
}

export interface CreateSubscriptionCheckoutResponse {
  url: string;
  /** Backend returns `checkoutSessionId`; mapped to `sessionId` at the API layer. */
  sessionId: string;
}

export interface UpdateSubscriptionRequest {
  quantity?: number;
  interval?: SubscriptionInterval;
  petId?: string | null;
}

export const SUBSCRIPTION_INTERVAL_LABEL: Record<SubscriptionInterval, string> =
  {
    '2_weeks': 'Every 2 weeks',
    '4_weeks': 'Every 4 weeks',
    '8_weeks': 'Every 8 weeks',
    '12_weeks': 'Every 12 weeks',
  };

export const SUBSCRIPTION_INTERVALS: SubscriptionInterval[] = [
  '2_weeks',
  '4_weeks',
  '8_weeks',
  '12_weeks',
];

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  canceled: 'Canceled',
  past_due: 'Past due',
  incomplete: 'Incomplete',
};

/** Preview subscribe unit price from one-time price and discount percent. */
export function previewSubscribeUnitPriceCents(
  priceCents: number,
  discountPercent: number,
): number {
  return Math.round((priceCents * (100 - discountPercent)) / 100);
}
