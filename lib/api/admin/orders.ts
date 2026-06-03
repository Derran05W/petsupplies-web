import type {
  AdminOrderListResponse,
  AdminOrderSummary,
  AdminOrderTrackingInput,
  AdminOrderUpdateInput,
} from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { apiFetch } from '../client';

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
  params.set('pageSize', String(pageSize));
  if (status) params.set('status', status);

  return apiFetch<AdminOrderListResponse>(
    `/admin/orders?${params.toString()}`,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
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
      ? { method: 'PATCH', body: JSON.stringify(input), accessToken }
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
      ? { method: 'PATCH', body: JSON.stringify(input), accessToken }
      : { method: 'PATCH', body: JSON.stringify(input) },
  );
}
