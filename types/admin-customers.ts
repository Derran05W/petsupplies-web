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
