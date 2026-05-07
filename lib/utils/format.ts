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
