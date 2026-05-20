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

export interface AdminOrderUpdateInput {
  status?: OrderStatus;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}

export interface AdminOrderTrackingInput {
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrier?: string | null;
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
