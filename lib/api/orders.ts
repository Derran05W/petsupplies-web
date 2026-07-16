import type { OrderSummary } from '@/types/order';
import type { OrderListResponse } from '@/types/account';
import {
  mapApiOrder,
  mapApiOrderListResponse,
  type ApiOrderDetail,
  type ApiOrderListResponse,
} from './order-mapper';
import { ApiError, apiFetch } from './client';

/** Matches petsupplies-api `listQuerySchema` default for `limit`. */
const DEFAULT_LIMIT = 20;

export interface GetOrdersOptions {
  page?: number;
  /** Page size — sent as `limit` query param (backend max 100). */
  limit?: number;
  status?: OrderSummary['status'];
  accessToken?: string;
}

/** GET `/orders`. Server-component callable — pass the Supabase access token from the request-scoped Supabase client. */
export async function getOrders(
  options: GetOrdersOptions = {},
): Promise<OrderListResponse> {
  const { page = 1, limit = DEFAULT_LIMIT, status, accessToken } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  // Backend `listQuerySchema` validates an UPPERCASE enum
  // (PENDING|PAID|SHIPPED|FULFILLED|CANCELLED); the app carries lowercase
  // status, so uppercase here to satisfy the validator.
  if (status) params.set('status', status.toUpperCase());

  const raw = await apiFetch<ApiOrderListResponse>(
    `/orders?${params.toString()}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapApiOrderListResponse(raw);
}

/** GET `/orders/:id`. Returns `null` on 404 — the page should call `notFound()`. */
export async function getOrderById(
  id: string,
  options: { accessToken?: string } = {},
): Promise<OrderSummary | null> {
  const { accessToken } = options;
  try {
    const raw = await apiFetch<ApiOrderDetail>(
      `/orders/${encodeURIComponent(id)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return mapApiOrder(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * GET `/orders/:id/shared?token=` — signed email links with no session.
 *
 * BACKEND GAP: this endpoint does not exist yet. Every `/orders/*` route is
 * behind bearer-auth middleware that runs BEFORE routing (`router.use('*',
 * auth)`), so a token-only, session-less request to this not-yet-public route
 * answers 401/403 (auth rejects it before the router can 404). A genuinely
 * missing order answers 404. For this public email landing page all three mean
 * the same thing — "there is no order to show here" — so we map them to `null`,
 * which the page renders as `notFound()`: a graceful, non-crashing degrade
 * rather than an unhandled `ApiError` / raw error screen.
 *
 * Returns `null` on HTTP 401, 403, or 404. Other failures (network, 5xx,
 * validation) propagate as `ApiError` for the caller to branch on.
 */
export async function getSharedOrder(
  orderId: string,
  token: string,
): Promise<OrderSummary | null> {
  try {
    const raw = await apiFetch<ApiOrderDetail>(
      `/orders/${encodeURIComponent(orderId)}/shared?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    return mapApiOrder(raw);
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.status === 401 || err.status === 403)
    ) {
      return null;
    }
    throw err;
  }
}
