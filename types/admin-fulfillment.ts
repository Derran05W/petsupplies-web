/**
 * Admin fulfillment — Phase 21 `/admin/fulfillment/*` and bulk ship.
 */

import type { AdminOrderSummary } from '@/types/admin';
import type { OrderStatus } from '@/types/order';

/** GET /admin/fulfillment/queue — app shape (mapped from the wire envelope). */
export interface AdminFulfillmentQueueResponse {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminBulkShipFailure {
  orderId: string;
  message: string;
}

/** POST /admin/fulfillment/bulk-ship — app-facing request. */
export interface AdminBulkShipRequest {
  orderIds: string[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

/** A successfully-shipped order from a bulk-ship batch. */
export interface AdminBulkShipResult {
  id: string;
  status: OrderStatus;
}

/** POST /admin/fulfillment/bulk-ship response (partial success supported) */
export interface AdminBulkShipResponse {
  updated: AdminBulkShipResult[];
  failed: AdminBulkShipFailure[];
}
