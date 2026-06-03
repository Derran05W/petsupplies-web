import type { OrderSummary } from '@/types/order';
import type { ApiOrderListResponse, OrderListResponse } from '@/types/account';
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
  if (status) params.set('status', status.toUpperCase());

  const raw = await apiFetch<ApiOrderListResponse>(
    `/orders?${params.toString()}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapApiOrderListResponse(raw);
}

function mapApiOrderListResponse(raw: ApiOrderListResponse): OrderListResponse {
  return {
    orders: raw.data,
    total: raw.total,
    page: raw.page,
    pageSize: raw.limit,
    totalPages: raw.totalPages,
  };
}

/** GET `/orders/:id`. Returns `null` on 404 — the page should call `notFound()`. */
export async function getOrderById(
  id: string,
  options: { accessToken?: string } = {},
): Promise<OrderSummary | null> {
  const { accessToken } = options;
  try {
    return await apiFetch<OrderSummary>(
      `/orders/${encodeURIComponent(id)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * GET `/orders/:id/shared?token=` — Phase 11 signed email links with no session.
 *
 * Returns `null` only on HTTP 404. Other failures (network, validation) propagate
 * as `ApiError` — no placeholder reconciliation.
 */
export async function getSharedOrder(
  orderId: string,
  token: string,
): Promise<OrderSummary | null> {
  try {
    return await apiFetch<OrderSummary>(
      `/orders/${encodeURIComponent(orderId)}/shared?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
