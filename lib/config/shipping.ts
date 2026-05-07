/**
 * Free-shipping threshold configuration.
 *
 * The numeric threshold lives in `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS`
 * so marketing can change it (and the homepage / cart progress bar / hero
 * tag card) by editing one env var. If the env var is missing, malformed,
 * or non-positive, we fall back to the default below — a $50 minimum that
 * matches the static copy on the hero "Free shipping on orders over $50"
 * tag card from Phase 3.
 *
 * Backend Phase 5 reads the same threshold to validate shipping at
 * checkout — keep both repos in sync when changing it.
 */
export const FREE_SHIPPING_DEFAULT_CENTS = 5000;

export function getFreeShippingThresholdCents(): number {
  const raw = process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS;
  if (typeof raw !== 'string' || raw.length === 0) {
    return FREE_SHIPPING_DEFAULT_CENTS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return FREE_SHIPPING_DEFAULT_CENTS;
  }
  return parsed;
}
