import type {
  OrderLine,
  OrderStatus,
  OrderSummary,
  ShippingAddress,
} from '@/types/order';
import { ApiError, apiFetch } from './client';
import {
  loadPendingCheckout,
  savePendingCheckout,
  type PendingCheckoutSnapshot,
} from '@/lib/checkout/storage';

/**
 * Sentinel session ID used by the placeholder fallback so the success
 * page can recognise the dev path and synthesise an order from the cart
 * snapshot in sessionStorage.
 *
 * TODO(phase 6): remove once backend phase 6 + 7 are on staging.
 */
export const PLACEHOLDER_SESSION_ID = 'cs_test_placeholder';

export interface CheckoutLineRequest {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  email: string;
  shippingAddress: ShippingAddress;
  lines: CheckoutLineRequest[];
  /** Supabase `user.id` when the customer is signed in. */
  clientReferenceId?: string;
}

export interface CreateCheckoutSessionResponse {
  /** Stripe Checkout Session URL — the frontend redirects here. */
  url: string;
  sessionId: string;
}

let warnedAboutFallback = false;

/**
 * POST `/checkout` to petsupplies-api. The backend creates a Stripe
 * Checkout Session and returns its URL + ID — the frontend then does a
 * full-page navigation to `url`.
 *
 * **Backend-not-ready fallback:** when the request fails with a network
 * error (status 0), we write the pending-checkout snapshot to
 * sessionStorage and return a sentinel response that points at our own
 * `/checkout/success?session_id=cs_test_placeholder`. This keeps the
 * entire Phase 6 surface exercisable against an offline / not-yet-deployed
 * backend, mirroring the Phase 4 product-fetch fallback.
 *
 * TODO(phase 6): remove fallback once backend phase 6 + 7 are on staging.
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest,
  snapshot: PendingCheckoutSnapshot,
): Promise<CreateCheckoutSessionResponse> {
  try {
    return await apiFetch<CreateCheckoutSessionResponse>('/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      savePendingCheckout(snapshot);
      if (!warnedAboutFallback) {
        warnedAboutFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[checkout] backend unreachable — using placeholder Stripe session for dev',
        );
      }
      return {
        url: `/checkout/success?session_id=${PLACEHOLDER_SESSION_ID}`,
        sessionId: PLACEHOLDER_SESSION_ID,
      };
    }
    throw err;
  }
}

/**
 * GET `/orders/by-checkout-session/:sessionId` from petsupplies-api.
 *
 * Returns `null` when the order doesn't exist yet (HTTP 404) — the
 * success-page poll uses that as the "still waiting on the webhook"
 * signal and keeps polling.
 *
 * **Backend-not-ready fallback:** when the request fails with a network
 * error AND the session ID is the placeholder, synthesise an
 * `OrderSummary` from the sessionStorage snapshot so the dev success
 * page renders a believable order.
 *
 * TODO(phase 6): remove fallback once backend phase 6 + 7 are on staging.
 */
export async function getOrderByCheckoutSession(
  sessionId: string,
): Promise<OrderSummary | null> {
  try {
    return await apiFetch<OrderSummary>(
      `/orders/by-checkout-session/${encodeURIComponent(sessionId)}`,
      { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      if (err.isNetworkError && sessionId === PLACEHOLDER_SESSION_ID) {
        return synthesisePlaceholderOrder(sessionId);
      }
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback — runs only when the backend is unreachable.                */
/* TODO(phase 6): remove once backend phase 6 + 7 are on staging.            */
/* -------------------------------------------------------------------------- */

function synthesisePlaceholderOrder(sessionId: string): OrderSummary | null {
  const snapshot = loadPendingCheckout();
  if (!snapshot) return null;

  const lines: OrderLine[] = snapshot.lines.map((line) => ({
    id: `ol_${line.productId}`,
    productId: line.productId,
    slug: line.slug,
    name: line.name,
    imageUrl: line.imageUrl,
    quantity: line.quantity,
    unitPriceCents: line.priceCents,
    lineTotalCents: line.priceCents * line.quantity,
  }));

  const status: OrderStatus = 'paid';

  return {
    id: `ord_dev_${Date.now().toString(36)}`,
    checkoutSessionId: sessionId,
    status,
    email: snapshot.email,
    shippingAddress: snapshot.shippingAddress,
    lines,
    subtotalCents: snapshot.subtotalCents,
    shippingCents: snapshot.shippingCents,
    taxCents: snapshot.taxCents,
    totalCents: snapshot.totalCents,
    currency: snapshot.currency,
    createdAt: snapshot.createdAt,
  };
}
