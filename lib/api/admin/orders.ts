import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderTrackingInput,
  AdminOrderUpdateInput,
} from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { apiFetch } from '../client';
import { mapApiOrderListItem, type ApiOrderListItem } from '../order-mapper';

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

  const raw = await apiFetch<ApiAdminOrderListResponse>(
    `/admin/orders?${params.toString()}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return mapAdminOrderListResponse(raw);
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
  return apiFetch<AdminOrderSummary>(
    `/admin/orders/${encodeURIComponent(id)}`,
    accessToken
      ? {
          method: 'PATCH',
          body: JSON.stringify(input),
          accessToken,
        }
      : { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export async function patchOrderTracking(
  id: string,
  input: AdminOrderTrackingInput,
  options: AdminApiOptions = {},
): Promise<AdminOrderSummary> {
  const { accessToken } = options;
  return apiFetch<AdminOrderSummary>(
    `/admin/orders/${encodeURIComponent(id)}/tracking`,
    accessToken
      ? {
          method: 'PATCH',
          body: JSON.stringify(input),
          accessToken,
        }
      : { method: 'PATCH', body: JSON.stringify(input) },
  );
}
