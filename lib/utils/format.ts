/**
 * Format a price expressed in the smallest currency unit (cents) into a
 * localized currency string. Defaults to CAD — the store ships to Canada
 * only and every Stripe amount is CAD, so this is the single source of
 * truth for product, cart, receipt, order-history, and admin surfaces.
 * `narrowSymbol` renders the plain `$` (e.g. `$24.99`) rather than the
 * locale-disambiguated `CA$24.99`, so an amount reads identically whether
 * or not the caller passes the currency explicitly.
 */
export function formatPrice(cents: number, currency: string = 'cad'): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: 'narrowSymbol',
  }).format(safeCents / 100);
}

/**
 * Format an ISO-8601 timestamp into a human-readable date string. Defaults
 * to the medium en-US style ("Mar 14, 2026"); pass `opts` to override.
 *
 * Returns the empty string for unparseable input rather than throwing —
 * the order list / detail pages would otherwise crash on a malformed
 * `createdAt` string from the backend.
 */
export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', opts).format(date);
}

/**
 * Map a stock count to a discrete state used by the admin dashboard
 * "low stock" alert and the products table's stock cell.
 *
 * Threshold defaults to `LOW_STOCK_THRESHOLD` from `lib/admin/config.ts`
 * (10) — pass an explicit value when a feature wants a different cliff
 * (e.g. a per-product threshold in a future phase).
 */
export type StockBadgeState = 'in_stock' | 'low' | 'out';

export function formatStockBadge(
  stockCount: number,
  threshold = 10,
): StockBadgeState {
  if (stockCount <= 0) return 'out';
  if (stockCount <= threshold) return 'low';
  return 'in_stock';
}
