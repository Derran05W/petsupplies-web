/**
 * Shared admin-surface config. Keep it tiny — anything bigger should live
 * next to the feature it describes.
 */

/**
 * Stock count at or below which a product is flagged "low" (dashboard
 * alerts + products table badge). Backend Phase 8 reads the same value
 * for the `lowStockCount` field on `DashboardStats`.
 */
export const LOW_STOCK_THRESHOLD = 10;
