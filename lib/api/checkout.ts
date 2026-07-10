import type { OrderSummary } from '@/types/order';
import type { ShippingSelectionInput } from '@/types/shipping';
import { ApiError, apiFetch } from './client';
import { getOrderById } from './orders';
import { mapApiOrder, type ApiOrderDetail } from './order-mapper';
import {
  loadPendingCheckout,
  savePendingCheckout,
  type PendingCheckoutSnapshot,
} from '@/lib/checkout/storage';
import {
  clearPendingOrderId,
  loadPendingOrderId,
  savePendingOrderId,
} from '@/lib/checkout/pending-order';

/**
 * Sentinel session ID used by the placeholder fallback so the success
 * page can recognise the dev path and synthesise an order from the cart
 * snapshot in sessionStorage.
 */
export const PLACEHOLDER_SESSION_ID = 'cs_test_placeholder';

export interface CreateCheckoutSessionRequest {
  shippingSelection?: ShippingSelectionInput;
}

export interface CreateCheckoutSessionOptions {
  accessToken: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  orderId: string;
}

let warnedAboutFallback = false;

/**
 * POST `/checkout/session` — body is `{}` or `{ shippingSelection }`.
 * Backend reads the authenticated user's server cart.
 */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest,
  options: CreateCheckoutSessionOptions,
): Promise<CreateCheckoutSessionResponse> {
  const body =
    request.shippingSelection !== undefined
      ? { shippingSelection: request.shippingSelection }
      : {};

  try {
    const result = await apiFetch<CreateCheckoutSessionResponse>(
      '/checkout/session',
      {
        method: 'POST',
        body: JSON.stringify(body),
        accessToken: options.accessToken,
      },
    );
    savePendingOrderId(result.orderId);
    return result;
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      if (!warnedAboutFallback) {
        warnedAboutFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[checkout] backend unreachable — using placeholder Stripe session for dev',
        );
      }
      return {
        url: `/checkout/success?session_id=${PLACEHOLDER_SESSION_ID}`,
        orderId: `ord_dev_${Date.now().toString(36)}`,
      };
    }
    throw err;
  }
}

export interface GetOrderByCheckoutSessionOptions {
  accessToken?: string;
}

/**
 * Poll order status after Stripe redirect. Uses pending order id saved at
 * session creation (backend has no by-checkout-session route).
 */
export async function getOrderByCheckoutSession(
  sessionId: string,
  options: GetOrderByCheckoutSessionOptions = {},
): Promise<OrderSummary | null> {
  const { accessToken } = options;

  if (sessionId === PLACEHOLDER_SESSION_ID) {
    return synthesisePlaceholderOrder(sessionId);
  }

  const pendingOrderId = loadPendingOrderId();
  if (pendingOrderId && accessToken) {
    try {
      const order = await getOrderById(pendingOrderId, { accessToken });
      if (order) {
        const status = String(order.status).toLowerCase();
        if (status === 'pending') {
          return null;
        }
        clearPendingOrderId();
        return { ...order, checkoutSessionId: sessionId };
      }
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) {
        throw err;
      }
    }
  }

  // BACKEND GAP: `GET /orders/by-checkout-session/:sessionId` does not exist
  // (only `GET /orders` and `GET /orders/:id` are mounted). It 404s, which we
  // treat as "order not confirmed yet" so the poll keeps retrying until it
  // either resolves via the saved pending order id above or times out into the
  // success page's friendly "still processing" panel. See `backendGaps`.
  try {
    const raw = await apiFetch<ApiOrderDetail>(
      `/orders/by-checkout-session/${encodeURIComponent(sessionId)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return { ...mapApiOrder(raw), checkoutSessionId: sessionId };
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

/** @deprecated Dev-only snapshot helper for placeholder checkout. */
export function saveDevCheckoutSnapshot(
  snapshot: PendingCheckoutSnapshot,
): void {
  savePendingCheckout(snapshot);
}

function synthesisePlaceholderOrder(sessionId: string): OrderSummary | null {
  const snapshot = loadPendingCheckout();
  if (!snapshot) return null;

  return {
    id: `ord_dev_${Date.now().toString(36)}`,
    checkoutSessionId: sessionId,
    status: 'paid',
    email: snapshot.email,
    shippingAddress: snapshot.shippingAddress,
    lines: snapshot.lines.map((line) => ({
      id: `ol_${line.productId}`,
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      imageUrl: line.imageUrl,
      quantity: line.quantity,
      unitPriceCents: line.priceCents,
      lineTotalCents: line.priceCents * line.quantity,
    })),
    subtotalCents: snapshot.subtotalCents,
    shippingCents: snapshot.shippingCents,
    taxCents: snapshot.taxCents,
    totalCents: snapshot.totalCents,
    currency: snapshot.currency,
    createdAt: snapshot.createdAt,
  };
}
