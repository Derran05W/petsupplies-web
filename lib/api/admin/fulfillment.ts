import type {
  AdminBulkShipRequest,
  AdminBulkShipResponse,
  AdminFulfillmentQueueResponse,
} from '@/types/admin-fulfillment';
import type { OrderStatus } from '@/types/order';
import { apiFetch } from '../client';

export interface AdminApiOptions {
  accessToken?: string;
}

export interface AdminFulfillmentQueueParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  accessToken?: string;
}

export async function adminFulfillmentQueue(
  params: AdminFulfillmentQueueParams = {},
): Promise<AdminFulfillmentQueueResponse> {
  const { page = 1, pageSize = 20, status, accessToken } = params;
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  if (status) q.set('status', status);
  return apiFetch<AdminFulfillmentQueueResponse>(
    `/admin/fulfillment/queue?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export async function adminBulkShip(
  body: AdminBulkShipRequest,
  options: AdminApiOptions = {},
): Promise<AdminBulkShipResponse> {
  const { accessToken } = options;
  return apiFetch<AdminBulkShipResponse>('/admin/fulfillment/bulk-ship', {
    method: 'POST',
    body: JSON.stringify(body),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
