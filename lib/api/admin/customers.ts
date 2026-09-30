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
import {
  INTERVAL_WIRE_TO_APP,
  STATUS_WIRE_TO_APP,
  type ApiSubscriptionInterval,
  type ApiSubscriptionStatus,
} from '../subscriptions';

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
  // The backend rejects `email` searches shorter than 2 characters with a 400,
  // so only send the filter when it will be accepted — a shorter or empty query
  // yields the unfiltered list instead of an error.
  const email = search?.trim() ?? '';
  if (email.length >= 2) q.set('email', email);
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

/**
 * Raw admin subscription row from
 * `adminCustomerService.listCustomerSubscriptions`. Unlike the storefront
 * `SubscriptionPublic`, the admin select carries NO nested product relation —
 * only `productId`. Prisma-shaped: UPPERCASE enums and `nextDeliveryAt` rather
 * than the app's `currentPeriodEnd`.
 */
interface ApiAdminSubscriptionRow {
  id: string;
  productId: string;
  petId: string | null;
  quantity: number;
  interval: ApiSubscriptionInterval;
  status: ApiSubscriptionStatus;
  discountPercent: number;
  nextDeliveryAt: string;
  createdAt: string;
}

/**
 * Map an admin subscription wire row → the app `Subscription`. The admin select
 * has no product relation, so product name / slug / image / unit price are
 * unknown: name and image are left empty (the list UI renders a `productId`
 * fallback for the name and a placeholder image) and the price is 0 (the UI
 * omits it when unavailable). Enums are lowercased via the shared subscription
 * maps; `nextDeliveryAt` becomes `currentPeriodEnd`.
 */
function mapAdminSubscriptionRow(row: ApiAdminSubscriptionRow): Subscription {
  return {
    id: row.id,
    productId: row.productId,
    productSlug: '',
    productName: '',
    productImageUrl: '',
    quantity: row.quantity,
    interval: INTERVAL_WIRE_TO_APP[row.interval],
    unitPriceCents: 0,
    status: STATUS_WIRE_TO_APP[row.status],
    cancelAtPeriodEnd: false,
    currentPeriodEnd: row.nextDeliveryAt,
    petId: row.petId,
    createdAt: row.createdAt,
  };
}

function normaliseSubscriptions(
  body: unknown,
): AdminCustomerSubscriptionsResponse {
  let rows: unknown[] = [];
  if (Array.isArray(body)) {
    rows = body;
  } else if (body && typeof body === 'object') {
    // Backend returns the standard `{ data: [...] }` envelope; `items` /
    // `subscriptions` are tolerated for older or fixture payload shapes.
    for (const key of ['data', 'items', 'subscriptions'] as const) {
      const value = (body as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        rows = value;
        break;
      }
    }
  }
  return rows.map((row) =>
    mapAdminSubscriptionRow(row as ApiAdminSubscriptionRow),
  );
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
