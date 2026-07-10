/**
 * Account-surface types — orders list response shape and saved-address
 * shape consumed by the Phase 7 `/account/*` pages.
 *
 * Backend contract (petsupplies-api):
 *   GET    /orders?page&limit&status?  → `ApiOrderListResponse` (mapped to `OrderListResponse`)
 *   GET    /orders/:id                 → `OrderSummary`
 *   GET    /addresses                     → `Address[]`
 *   POST   /addresses                     → `Address`
 *   PATCH  /addresses/:id                 → `Address`
 *   DELETE /addresses/:id                 → 204
 *   POST   /addresses/:id/default         → `Address`
 */

import type { OrderSummary, ShippingAddress } from './order';

export type AddressId = string;

export interface Address extends ShippingAddress {
  id: AddressId;
  isDefault: boolean;
  createdAt: string;
}

/**
 * Raw paginated list from `GET /orders` — the wire types (`ApiOrderListResponse`,
 * `ApiOrderListItem`, …) live alongside their mappers in
 * [lib/api/order-mapper.ts](../lib/api/order-mapper.ts).
 */

/** Normalized list shape used by account UI components. */
export interface OrderListResponse {
  orders: OrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
