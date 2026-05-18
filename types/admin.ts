/**
 * Admin-surface types — the contract between the Phase 8 admin pages and
 * the petsupplies-api admin endpoints.
 *
 * Backend Phase 8 contract:
 *   GET    /admin/dashboard                       → DashboardStats
 *   GET    /admin/products?page&search&stock      → AdminProductListResponse
 *   GET    /admin/products/:id                    → AdminProduct
 *   POST   /admin/products                        → AdminProduct
 *   PATCH  /admin/products/:id                    → AdminProduct
 *   DELETE /admin/products/:id                    → 204
 *   POST   /admin/products/generate-description   → text/plain stream
 *   GET    /admin/orders?page&status              → AdminOrderListResponse
 *   PATCH  /admin/orders/:id                      → AdminOrderSummary
 *
 * Decision: `AdminProduct = Product & { isPublished: boolean }` rather than
 * a forked type. `Product` already carries `inStock`, `stockCount`, `tags`,
 * `description`, `images`, etc. — the only admin-only field is the
 * `isPublished` toggle the form exposes as "Active". Saves the table from
 * a transform layer.
 */

import type {
  Category,
  PetType,
  Product,
  ProductImage,
  NutritionalInfo,
} from '@/types/product';
import type { OrderSummary, OrderStatus } from '@/types/order';

export interface AdminProduct extends Product {
  /** Whether the product is visible on the customer-facing surface. */
  isPublished: boolean;
}

/** The editable subset that flows from the admin form to the backend. */
export interface AdminProductInput {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number;
  category: Category;
  petType: PetType;
  images: ProductImage[];
  nutritionalInfo?: NutritionalInfo;
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

/**
 * Admin order row — extends the customer `OrderSummary` with the bits the
 * admin table needs (customer email + raw Supabase user id) so the row
 * can render the Customer column without a join.
 */
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

/** PATCH /admin/orders/:id/tracking — Phase 21; do not send status here. */
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
  /** Up to five lowest-stock products for the dashboard quick list. */
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stockCount: number;
    primaryImageUrl: string;
  }>;
}

/** Stock state used as a URL filter on the products list. */
export type StockState = 'all' | 'in_stock' | 'low' | 'out';
