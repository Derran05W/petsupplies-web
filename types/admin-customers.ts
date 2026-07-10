/**
 * Admin customers — Phase 21 `/admin/customers*` routes.
 */

import type { OrderSummary } from '@/types/order';
import type { Subscription } from '@/types/subscription';

export interface AdminCustomerListRow {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
  ordersCount: number;
  lifetimeValueCents: number;
  currency: string;
}

/** GET /admin/customers */
export interface AdminCustomerListResponse {
  customers: AdminCustomerListRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** GET /admin/customers/:id */
export interface AdminCustomerDetail extends AdminCustomerListRow {
  defaultAddress?: string | null;
  lastOrderAt?: string | null;
  subscriptionsCount?: number;
}

/** GET /admin/customers/:id/orders */
export interface AdminCustomerOrdersResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** GET /admin/customers/:id/subscriptions — bare array or wrapped */
export type AdminCustomerSubscriptionsResponse = Subscription[];

/* -------------------------------------------------------------------------- */
/* Wire types (petsupplies-api → mapped to the app shapes above)              */
/* -------------------------------------------------------------------------- */

/** Row from `adminCustomerService.listCustomers`. */
export interface ApiAdminCustomerRow {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  createdAt: string;
  orderCount: number;
  lifetimeValueCents: number;
}

/** GET /admin/customers wire envelope. */
export interface ApiAdminCustomerListResponse {
  data: ApiAdminCustomerRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /admin/customers/:id wire shape (counts are nested). */
export interface ApiAdminCustomerDetail {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  createdAt: string;
  counts: {
    orders: number;
    subscriptions: number;
    addresses?: number;
    reviews?: number;
    wishlist?: number;
    pets?: number;
  };
  lifetimeValueCents: number;
  lastOrderAt?: string | null;
}
