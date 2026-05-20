/** Env-only free-shipping threshold — safe for client bundles and fallbacks. */
export const FREE_SHIPPING_DEFAULT_CENTS = 5000;

export function getFreeShippingThresholdCentsFromEnv(): number {
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

/** Sync fallback for client components (`FreeShippingThresholdProvider`). */
export function getFreeShippingThresholdCentsSync(): number {
  return getFreeShippingThresholdCentsFromEnv();
}
