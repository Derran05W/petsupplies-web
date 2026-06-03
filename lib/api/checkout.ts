import type { OrderSummary } from '@/types/order';
import type { ShippingSelectionInput } from '@/types/shipping';
import { ApiError, apiFetch } from './client';
import { getOrderById } from './orders';
import {
  clearPendingOrderId,
  loadPendingOrderId,
  savePendingOrderId,
} from '@/lib/checkout/pending-order';

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

/** POST `/checkout/session` — body is `{}` or `{ shippingSelection }`. Backend reads the authenticated user's server cart. */
export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest,
  options: CreateCheckoutSessionOptions,
): Promise<CreateCheckoutSessionResponse> {
  const body =
    request.shippingSelection !== undefined
      ? { shippingSelection: request.shippingSelection }
      : {};

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
}

export interface GetOrderByCheckoutSessionOptions {
  accessToken?: string;
}

/** Poll order status after Stripe redirect. Uses pending order id saved at session creation. */
export async function getOrderByCheckoutSession(
  sessionId: string,
  options: GetOrderByCheckoutSessionOptions = {},
): Promise<OrderSummary | null> {
  const { accessToken } = options;

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

  try {
    return await apiFetch<OrderSummary>(
      `/orders/by-checkout-session/${encodeURIComponent(sessionId)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
