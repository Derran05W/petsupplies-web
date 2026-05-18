import type {
  AdminCustomerDetail,
  AdminCustomerListResponse,
  AdminCustomerOrdersResponse,
  AdminCustomerSubscriptionsResponse,
} from '@/types/admin-customers';
import type { Subscription } from '@/types/subscription';
import { apiFetch } from '../client';

export interface AdminApiOptions {
  accessToken?: string;
}

export interface AdminCustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accessToken?: string;
}

export async function adminListCustomers(
  params: AdminCustomerListParams = {},
): Promise<AdminCustomerListResponse> {
  const { page = 1, pageSize = 20, search, accessToken } = params;
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  if (search?.trim()) q.set('search', search.trim());
  return apiFetch<AdminCustomerListResponse>(`/admin/customers?${q}`, {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}

export async function adminGetCustomer(
  id: string,
  options: AdminApiOptions = {},
): Promise<AdminCustomerDetail> {
  const { accessToken } = options;
  return apiFetch<AdminCustomerDetail>(
    `/admin/customers/${encodeURIComponent(id)}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

export interface AdminCustomerOrdersParams {
  page?: number;
  pageSize?: number;
  accessToken?: string;
}

export async function adminGetCustomerOrders(
  customerId: string,
  params: AdminCustomerOrdersParams = {},
): Promise<AdminCustomerOrdersResponse> {
  const { page = 1, pageSize = 10, accessToken } = params;
  const q = new URLSearchParams();
  q.set('page', String(page));
  q.set('pageSize', String(pageSize));
  return apiFetch<AdminCustomerOrdersResponse>(
    `/admin/customers/${encodeURIComponent(customerId)}/orders?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
}

function normaliseSubscriptions(
  body: unknown,
): AdminCustomerSubscriptionsResponse {
  if (Array.isArray(body)) return body as Subscription[];
  if (
    body &&
    typeof body === 'object' &&
    'items' in body &&
    Array.isArray((body as { items: unknown }).items)
  ) {
    return (body as { items: Subscription[] }).items;
  }
  if (
    body &&
    typeof body === 'object' &&
    'subscriptions' in body &&
    Array.isArray((body as { subscriptions: unknown }).subscriptions)
  ) {
    return (body as { subscriptions: Subscription[] }).subscriptions;
  }
  return [];
}

export async function adminGetCustomerSubscriptions(
  customerId: string,
  options: AdminApiOptions = {},
): Promise<AdminCustomerSubscriptionsResponse> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>(
    `/admin/customers/${encodeURIComponent(customerId)}/subscriptions`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
  return normaliseSubscriptions(raw);
}
