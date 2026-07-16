import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderTrackingInput,
  AdminOrderTrackingResult,
  AdminOrderUpdateInput,
} from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { apiFetch } from '../client';
import {
  mapApiOrder,
  mapApiOrderListItem,
  type ApiOrderDetail,
  type ApiOrderListItem,
  type ApiOrderStatus,
} from '../order-mapper';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Statuses the backend `adminListQuerySchema` enum accepts. `delivered` and
 * `refunded` exist in the app union but are NOT Prisma `OrderStatus` values —
 * forwarding them would 400, so `adminListOrders` drops anything off this list.
 */
const ADMIN_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'fulfilled',
  'cancelled',
];

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

/**
 * Admin order-detail row: the full order (with `ship*` address columns) plus
 * the `user` relation. Returned by BOTH `GET /admin/orders/:id` and
 * `PATCH /admin/orders/:id/status` (which returns `getAdminOrder`).
 */
interface ApiAdminOrderDetail extends ApiOrderDetail {
  user: { id: string; email: string; name: string | null } | null;
}

/**
 * `PATCH /admin/orders/:id/tracking` echoes only these columns — no line
 * items, totals or address — so it maps to a partial result the mutation
 * merges onto the cached row.
 */
interface ApiAdminTrackingResponse {
  id: string;
  status: ApiOrderStatus;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
  createdAt: string;
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
    ...(row.carrier ? { carrier: row.carrier } : {}),
    email: row.user?.email ?? base.email,
    customerEmail: row.user?.email ?? '',
    customerId: row.user?.id ?? '',
    ...(row.user?.name ? { customerName: row.user.name } : {}),
  };
}

/** Detail row → `AdminOrderSummary`. Unlike the list row this carries the
 *  `ship*` address columns, so `mapApiOrder` fills `shippingAddress`. */
function mapAdminOrderDetail(row: ApiAdminOrderDetail): AdminOrderSummary {
  const base = mapApiOrder(row);
  return {
    ...base,
    ...(row.carrier ? { carrier: row.carrier } : {}),
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
  // UPPERCASE status enum. Only forward statuses the enum accepts.
  params.set('limit', String(pageSize));
  if (status && ADMIN_ORDER_STATUSES.includes(status)) {
    params.set('status', status.toUpperCase());
  }

  const raw = await apiFetch<ApiAdminOrderListResponse>(
    `/admin/orders?${params.toString()}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapAdminOrderListResponse(raw);
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `GET /admin/orders/:id` — the full order INCLUDING the `ship*` columns the
 * list rows omit. The detail drawer fetches this so "Shipping to" renders.
 */
export async function adminGetOrder(
  id: string,
  options: AdminApiOptions = {},
): Promise<AdminOrderSummary> {
  const { accessToken } = options;
  const raw = await apiFetch<ApiAdminOrderDetail>(
    `/admin/orders/${encodeURIComponent(id)}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapAdminOrderDetail(raw);
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * `PATCH /admin/orders/:id/status`. The backend enum only accepts
 * CANCELLED|SHIPPED|FULFILLED (status is uppercased here); `trackingNumber` +
 * `carrier` are required together when status is `shipped` (the caller
 * enforces this, mirroring the backend superRefine). The endpoint returns the
 * full order detail, mapped so the React Query cache holds app-shaped data.
 */
export async function adminUpdateOrder(
  id: string,
  input: AdminOrderUpdateInput,
  options: AdminApiOptions = {},
): Promise<AdminOrderSummary> {
  const { accessToken } = options;
  const body: { status: string; trackingNumber?: string; carrier?: string } = {
    status: input.status.toUpperCase(),
  };
  if (input.trackingNumber) body.trackingNumber = input.trackingNumber;
  if (input.carrier) body.carrier = input.carrier;

  const raw = await apiFetch<ApiAdminOrderDetail>(
    `/admin/orders/${encodeURIComponent(id)}/status`,
    accessToken
      ? { method: 'PATCH', body: JSON.stringify(body), accessToken }
      : { method: 'PATCH', body: JSON.stringify(body) },
  );
  return mapAdminOrderDetail(raw);
}

/**
 * `PATCH /admin/orders/:id/tracking`. Backend `adminUpdateTrackingSchema`
 * requires BOTH `trackingNumber` and `carrier` (min 1); `trackingUrl` has no
 * backend column and is dropped. Returns a partial result (the endpoint echoes
 * only the mutable columns).
 */
export async function patchOrderTracking(
  id: string,
  input: AdminOrderTrackingInput,
  options: AdminApiOptions = {},
): Promise<AdminOrderTrackingResult> {
  const { accessToken } = options;
  const body = {
    trackingNumber: (input.trackingNumber ?? '').trim(),
    carrier: (input.carrier ?? '').trim(),
  };
  const raw = await apiFetch<ApiAdminTrackingResponse>(
    `/admin/orders/${encodeURIComponent(id)}/tracking`,
    accessToken
      ? { method: 'PATCH', body: JSON.stringify(body), accessToken }
      : { method: 'PATCH', body: JSON.stringify(body) },
  );
  return {
    id: raw.id,
    status: raw.status.toLowerCase() as OrderStatus,
    ...(raw.trackingNumber ? { trackingNumber: raw.trackingNumber } : {}),
    ...(raw.carrier ? { carrier: raw.carrier } : {}),
  };
}
