import type { OrderSummary } from '@/types/order';
import type { OrderListResponse } from '@/types/account';
import { ApiError, apiFetch } from './client';
import { PLACEHOLDER_ORDERS } from '@/lib/placeholder/orders';
import { loadPendingCheckout } from '@/lib/checkout/storage';

const DEFAULT_PAGE_SIZE = 10;

export interface GetOrdersOptions {
  page?: number;
  pageSize?: number;
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
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    status,
    accessToken,
  } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (status) params.set('status', status);

  try {
    return await apiFetch<OrderListResponse>(
      `/orders?${params.toString()}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      if (!warnedAboutOrdersFallback) {
        warnedAboutOrdersFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[orders] backend unreachable — using placeholder orders for dev',
        );
      }
      return synthesisePlaceholderList({ page, pageSize });
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
    return await apiFetch<OrderSummary>(
      `/orders/${encodeURIComponent(id)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      if (err.isNetworkError) {
        return findPlaceholderOrder(id);
      }
    }
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
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function synthesisePlaceholderList(opts: {
  page: number;
  pageSize: number;
}): OrderListResponse {
  const all = getAllPlaceholderOrders();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / opts.pageSize));
  const safePage = Math.min(Math.max(1, opts.page), totalPages);
  const start = (safePage - 1) * opts.pageSize;
  return {
    orders: all.slice(start, start + opts.pageSize),
    total,
    page: safePage,
    pageSize: opts.pageSize,
    totalPages,
  };
}

function findPlaceholderOrder(id: string): OrderSummary | null {
  const seed = PLACEHOLDER_ORDERS.find((order) => order.id === id);
  if (seed) return seed;
  if (id.startsWith('ord_dev_')) {
    const pending = synthesisePendingCheckoutOrder();
    if (pending) return { ...pending, id };
  }
  return null;
}
