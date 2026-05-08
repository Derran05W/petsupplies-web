/**
 * Format a price expressed in the smallest currency unit (cents) into a
 * localized currency string. Defaults to USD because that's the launch
 * market — multi-currency arrives with backend Phase 6.
 */
export function formatPrice(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
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
