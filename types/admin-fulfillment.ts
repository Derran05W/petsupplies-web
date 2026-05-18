/**
 * Admin fulfillment — Phase 21 `/admin/fulfillment/*` and bulk ship.
 */

import type { AdminOrderSummary } from '@/types/admin';

/** GET /admin/fulfillment/queue */
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

/** POST /admin/fulfillment/bulk-ship */
export interface AdminBulkShipRequest {
  orderIds: string[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

/** POST /admin/fulfillment/bulk-ship response (partial success supported) */
export interface AdminBulkShipResponse {
  updated: AdminOrderSummary[];
  failed: AdminBulkShipFailure[];
}
