import { fetchSiteSettings } from '@/lib/api/site/settings';

export {
  FREE_SHIPPING_DEFAULT_CENTS,
  getFreeShippingThresholdCentsFromEnv,
  getFreeShippingThresholdCentsSync,
} from '@/lib/config/shipping-env';

/**
 * Free-shipping threshold configuration.
 *
 * Canonical value: `GET /site/settings` (`freeShippingThresholdCents`).
 * `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS` is a build-time fallback when
 * the API is unreachable.
 */

/** Server helper — reads live settings with env fallback. */
export async function getFreeShippingThresholdCents(): Promise<number> {
  const settings = await fetchSiteSettings();
  return settings.freeShippingThresholdCents;
}
