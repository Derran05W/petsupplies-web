import type { OrderSummary } from '@/types/order';
import type { OrderListResponse } from '@/types/account';
import {
  mapApiOrder,
  mapApiOrderListResponse,
  type ApiOrderDetail,
  type ApiOrderListResponse,
} from './order-mapper';
import { ApiError, apiFetch } from './client';
import { isBackendUnreachableError } from './unreachable';
import { PLACEHOLDER_ORDERS } from '@/lib/placeholder/orders';
import { loadPendingCheckout } from '@/lib/checkout/storage';
import { applyOrderOverride } from '@/lib/admin/storage';

/** Matches petsupplies-api `listQuerySchema` default for `limit`. */
const DEFAULT_LIMIT = 20;

export interface GetOrdersOptions {
  page?: number;
  /** Page size — sent as `limit` query param (backend max 100). */
  limit?: number;
  status?: OrderSummary['status'];
  /** Supabase access token. Required by the backend; only omitted when
   * the caller knows the network is unreachable and only the fallback
   * matters. */
  accessToken?: string;
}

let warnedAboutOrdersFallback = false;

/**
 * GET `/orders`. Server-component callable — pass the Supabase access
 * token from the request-scoped Supabase client.
 *
 * **Backend-not-ready fallback:** when the request fails with a network
 * error, we synthesise a list from `loadPendingCheckout()` (when the
 * customer has just walked through the placeholder checkout in this
 * browser) plus the seeded `PLACEHOLDER_ORDERS` rows. Paginated client-
 * side. Single console warning per session.
 *
 * TODO(phase 7): remove fallback once backend phase 8 is on staging.
 */
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

  try {
    const raw = await apiFetch<ApiOrderListResponse>(
      `/orders?${params.toString()}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return mapApiOrderListResponse(raw);
  } catch (err) {
    if (
      err instanceof ApiError &&
      isBackendUnreachableError(err) &&
      process.env.NODE_ENV === 'development'
    ) {
      if (!warnedAboutOrdersFallback) {
        warnedAboutOrdersFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[orders] backend unreachable — using placeholder orders for dev',
        );
      }
      return synthesisePlaceholderList({ page, limit });
    }
    throw err;
  }
}

/**
 * GET `/orders/:id`. Returns `null` when the order doesn't exist (404)
 * — the page should call `notFound()`.
 *
 * **Backend-not-ready fallback:** if the network is unreachable AND the
 * ID matches one of the seeded placeholders OR a Phase 6 `ord_dev_*`
 * synthesised ID (which is recreated from the pending-checkout
 * snapshot), return that order. Otherwise return null.
 *
 * TODO(phase 7): remove fallback once backend phase 8 is on staging.
 */
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
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      if (
        isBackendUnreachableError(err) &&
        process.env.NODE_ENV === 'development'
      ) {
        return findPlaceholderOrder(id);
      }
    }
    throw err;
  }
}

/**
 * GET `/orders/:id/shared?token=` — signed email links with no session.
 *
 * BACKEND GAP: this endpoint does not exist yet (all `/orders/*` routes are
 * behind bearer-auth middleware; there is no public shared route). Until the
 * backend ships it, the request 404s / 401s and this returns `null`, which the
 * email landing page renders as `notFound()` — a graceful, non-crashing
 * degrade rather than an infinite spinner. See `backendGaps` in the workflow.
 *
 * Returns `null` on HTTP 404 (missing/not-found). Other failures (network,
 * validation, 401) propagate as `ApiError` for the caller to branch on.
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
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback — runs only when the backend is unreachable.                */
/* TODO(phase 7): remove once backend phase 8 is on staging.                  */
/* -------------------------------------------------------------------------- */

function synthesisePendingCheckoutOrder(): OrderSummary | null {
  const snapshot = loadPendingCheckout();
  if (!snapshot) return null;
  return {
    id: 'ord_dev_pending_snapshot',
    checkoutSessionId: 'cs_test_pending_snapshot',
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

function getAllPlaceholderOrders(): OrderSummary[] {
  const pending = synthesisePendingCheckoutOrder();
  const orders: OrderSummary[] = [];
  if (pending) orders.push(pending);
  orders.push(...PLACEHOLDER_ORDERS);
  // TODO(phase 8): when an admin updates an order in the dev-fallback
  // surface, the override is written to localStorage; merge it here so
  // the customer-facing order list / detail reflects the change without
  // a backend round-trip. Production path is untouched — overrides are
  // only ever read on the network-error branch.
  const merged = orders.map((order) => applyOrderOverride(order));
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function synthesisePlaceholderList(opts: {
  page: number;
  limit: number;
}): OrderListResponse {
  const all = getAllPlaceholderOrders();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / opts.limit));
  const safePage = Math.min(Math.max(1, opts.page), totalPages);
  const start = (safePage - 1) * opts.limit;
  return {
    orders: all.slice(start, start + opts.limit),
    total,
    page: safePage,
    pageSize: opts.limit,
    totalPages,
  };
}

function findPlaceholderOrder(id: string): OrderSummary | null {
  const seed = PLACEHOLDER_ORDERS.find((order) => order.id === id);
  if (seed) return applyOrderOverride(seed);
  if (id.startsWith('ord_dev_')) {
    const pending = synthesisePendingCheckoutOrder();
    if (pending) return applyOrderOverride({ ...pending, id });
  }
  return null;
}
