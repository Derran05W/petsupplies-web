/**
 * Admin-surface types — Phase 26 `/admin/products` contract.
 */

import type { ProductImage } from '@/types/product';
import type { AdminProductCategory } from '@/types/admin-product-api';
import type { OrderSummary, OrderStatus } from '@/types/order';

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: AdminProductCategory;
  images: ProductImage[];
  inStock: boolean;
  stockCount: number;
  tags: string[];
  createdAt: string;
  /** Maps to backend `active`. */
  isPublished: boolean;
  imageUrl?: string | null;
}

/** Payload the admin product form sends to `lib/api/admin/products`. */
export interface AdminProductInput {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  category: AdminProductCategory;
  images: ProductImage[];
  stockCount: number;
  tags: string[];
  isPublished: boolean;
}

export interface AdminProductListResponse {
  products: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminOrderSummary extends OrderSummary {
  customerEmail: string;
  customerId: string;
  customerName?: string;
}

export interface AdminOrderListResponse {
  orders: AdminOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Payload for `PATCH /admin/orders/:id/status`. `status` is app-lowercase
 * (mapped to the UPPERCASE wire enum by `adminUpdateOrder`); the backend only
 * accepts cancelled/shipped/fulfilled. `trackingNumber` + `carrier` are
 * required together when `status` is `shipped` (backend superRefine).
 */
export interface AdminOrderUpdateInput {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}

export interface AdminOrderTrackingInput {
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
}

/**
 * `PATCH /admin/orders/:id/tracking` echoes only the mutable columns (no line
 * items / totals / address), so the mutation merges these onto the cached row
 * rather than replacing it.
 */
export interface AdminOrderTrackingResult {
  id: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}

export interface DashboardStats {
  ordersThisWeek: number;
  ordersLastWeek: number;
  revenueCentsThisWeek: number;
  revenueCentsLastWeek: number;
  lowStockCount: number;
  currency: string;
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stockCount: number;
    primaryImageUrl: string;
  }>;
}

/** Client-side stock filter on the admin products list (not an API param). */
export type StockState = 'all' | 'in_stock' | 'low' | 'out';
