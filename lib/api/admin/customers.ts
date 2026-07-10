import type {
  AdminCustomerDetail,
  AdminCustomerListResponse,
  AdminCustomerListRow,
  AdminCustomerOrdersResponse,
  AdminCustomerSubscriptionsResponse,
  ApiAdminCustomerDetail,
  ApiAdminCustomerListResponse,
  ApiAdminCustomerRow,
} from '@/types/admin-customers';
import type { Subscription } from '@/types/subscription';
import { apiFetch } from '../client';
import {
  mapApiOrderListResponse,
  type ApiOrderListResponse,
} from '../order-mapper';

export interface AdminApiOptions {
  accessToken?: string;
}

/**
 * The backend `User` model has no per-customer currency; lifetime value is
 * summed in the single store currency. Default here.
 * followup: backend should expose the store currency on customer rows.
 */
const DEFAULT_CURRENCY = 'cad';

function mapCustomerRow(row: ApiAdminCustomerRow): AdminCustomerListRow {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    ordersCount: row.orderCount,
    lifetimeValueCents: row.lifetimeValueCents,
    currency: DEFAULT_CURRENCY,
  };
}

function mapCustomerListResponse(
  raw: ApiAdminCustomerListResponse,
): AdminCustomerListResponse {
  return {
    customers: raw.data.map(mapCustomerRow),
    total: raw.total,
    page: raw.page,
    pageSize: raw.limit,
    totalPages: raw.totalPages,
  };
}

function mapCustomerDetail(raw: ApiAdminCustomerDetail): AdminCustomerDetail {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    createdAt: raw.createdAt,
    ordersCount: raw.counts.orders,
    lifetimeValueCents: raw.lifetimeValueCents,
    currency: DEFAULT_CURRENCY,
    subscriptionsCount: raw.counts.subscriptions,
    ...(raw.lastOrderAt ? { lastOrderAt: raw.lastOrderAt } : {}),
  };
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
  // Backend `listQuerySchema` uses `limit`; it filters by `email` (not `search`).
  q.set('limit', String(pageSize));
  if (search?.trim()) q.set('email', search.trim());
  const raw = await apiFetch<ApiAdminCustomerListResponse>(
    `/admin/customers?${q}`,
    {
      cache: 'no-store',
      ...(accessToken ? { accessToken } : {}),
    },
  );
  return mapCustomerListResponse(raw);
}

export async function adminGetCustomer(
  id: string,
  options: AdminApiOptions = {},
): Promise<AdminCustomerDetail> {
  const { accessToken } = options;
  const raw = await apiFetch<ApiAdminCustomerDetail>(
    `/admin/customers/${encodeURIComponent(id)}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
  return mapCustomerDetail(raw);
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
  // Backend `customerOrdersQuerySchema` uses `limit`; response is the shared
  // admin-order envelope (`{ data, limit, ... }`).
  q.set('limit', String(pageSize));
  const raw = await apiFetch<ApiOrderListResponse>(
    `/admin/customers/${encodeURIComponent(customerId)}/orders?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
  return mapApiOrderListResponse(raw);
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
