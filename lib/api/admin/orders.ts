import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderTrackingInput,
  AdminOrderUpdateInput,
} from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { ApiError, apiFetch } from '../client';
import { mapApiOrderListItem, type ApiOrderListItem } from '../order-mapper';
import { PLACEHOLDER_ORDERS } from '@/lib/placeholder/orders';
import {
  applyOrderOverride,
  loadOrderOverrides,
  setOrderOverride,
} from '@/lib/admin/storage';
import { loadPendingCheckout } from '@/lib/checkout/storage';

const DEFAULT_PAGE_SIZE = 20;

export interface AdminOrderListOptions {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  accessToken?: string;
}

export interface AdminApiOptions {
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers (petsupplies-api → app shape)                         */
/* -------------------------------------------------------------------------- */

/** Admin order-list row: the user-facing list row plus the `user` relation. */
interface ApiAdminOrderRow extends ApiOrderListItem {
  user: { id: string; email: string; name: string | null } | null;
}

/** Raw paginated envelope from `GET /admin/orders`. */
interface ApiAdminOrderListResponse {
  data: ApiAdminOrderRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function mapAdminOrderRow(row: ApiAdminOrderRow): AdminOrderSummary {
  const base = mapApiOrderListItem(row);
  return {
    ...base,
    email: row.user?.email ?? base.email,
    customerEmail: row.user?.email ?? '',
    customerId: row.user?.id ?? '',
    ...(row.user?.name ? { customerName: row.user.name } : {}),
  };
}

function mapAdminOrderListResponse(
  raw: ApiAdminOrderListResponse,
): AdminOrderListResponse {
  return {
    orders: raw.data.map(mapAdminOrderRow),
    total: raw.total,
    page: raw.page,
    pageSize: raw.limit,
    totalPages: raw.totalPages,
  };
}

let warnedAboutAdminOrdersFallback = false;

function warnFallback(): void {
  if (warnedAboutAdminOrdersFallback) return;
  warnedAboutAdminOrdersFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[admin/orders] backend unreachable — using placeholder orders + override store for dev',
  );
}

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export async function adminListOrders(
  options: AdminOrderListOptions = {},
): Promise<AdminOrderListResponse> {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    status,
    accessToken,
  } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  // Backend `adminListQuerySchema` uses `limit` (not `pageSize`) and an
  // UPPERCASE status enum.
  params.set('limit', String(pageSize));
  if (status) params.set('status', status.toUpperCase());

  try {
    const raw = await apiFetch<ApiAdminOrderListResponse>(
      `/admin/orders?${params.toString()}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return mapAdminOrderListResponse(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      return localList({ page, pageSize, status });
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminUpdateOrder(
  id: string,
  input: AdminOrderUpdateInput,
  options: AdminApiOptions = {},
): Promise<AdminOrderSummary> {
  const { accessToken } = options;
  try {
    return await apiFetch<AdminOrderSummary>(
      `/admin/orders/${encodeURIComponent(id)}`,
      accessToken
        ? {
            method: 'PATCH',
            body: JSON.stringify(input),
            accessToken,
          }
        : { method: 'PATCH', body: JSON.stringify(input) },
    );
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      setOrderOverride(id, {
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.trackingNumber !== undefined
          ? { trackingNumber: input.trackingNumber }
          : {}),
        ...(input.trackingUrl !== undefined
          ? { trackingUrl: input.trackingUrl }
          : {}),
      });
      const all = getAllAdminOrders();
      const updated = all.find((o) => o.id === id);
      if (!updated) throw new ApiError('Order not found', 404);
      return updated;
    }
    throw err;
  }
}

export async function patchOrderTracking(
  id: string,
  input: AdminOrderTrackingInput,
  options: AdminApiOptions = {},
): Promise<AdminOrderSummary> {
  const { accessToken } = options;
  try {
    return await apiFetch<AdminOrderSummary>(
      `/admin/orders/${encodeURIComponent(id)}/tracking`,
      accessToken
        ? {
            method: 'PATCH',
            body: JSON.stringify(input),
            accessToken,
          }
        : { method: 'PATCH', body: JSON.stringify(input) },
    );
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      setOrderOverride(id, {
        ...(input.trackingNumber !== undefined
          ? { trackingNumber: input.trackingNumber }
          : {}),
        ...(input.trackingUrl !== undefined
          ? { trackingUrl: input.trackingUrl }
          : {}),
      });
      const all = getAllAdminOrders();
      const updated = all.find((o) => o.id === id);
      if (!updated) throw new ApiError('Order not found', 404);
      return updated;
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback                                                             */
/* TODO(phase 8): remove once backend phase 8 admin endpoints are on staging. */
/* -------------------------------------------------------------------------- */

function synthesisePendingCheckoutOrder(): AdminOrderSummary | null {
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
    customerEmail: snapshot.email,
    customerId: 'usr_dev_pending',
    customerName: snapshot.shippingAddress.fullName,
  };
}

function getAllAdminOrders(): AdminOrderSummary[] {
  const overrides = loadOrderOverrides();
  const seeded: AdminOrderSummary[] = PLACEHOLDER_ORDERS.map((order) =>
    applyOrderOverride(
      {
        ...order,
        customerEmail: order.email ?? '',
        customerId: 'usr_dev_seed',
        customerName: order.shippingAddress.fullName,
      },
      overrides,
    ),
  );
  const orders: AdminOrderSummary[] = [];
  const pending = synthesisePendingCheckoutOrder();
  if (pending) orders.push(applyOrderOverride(pending, overrides));
  orders.push(...seeded);
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function localList(opts: {
  page: number;
  pageSize: number;
  status?: OrderStatus;
}): AdminOrderListResponse {
  let all = getAllAdminOrders();
  if (opts.status) {
    all = all.filter((order) => order.status === opts.status);
  }
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
