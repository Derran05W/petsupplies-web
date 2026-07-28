import { fetchSiteSettings } from '@/lib/api/site/settings';
import type { RewardTier } from '@/types/site';

/**
 * Gift-reward tier configuration.
 *
 * Canonical value: `GET /site/settings` (`rewardTiers`). Returns `[]` when the
 * feature is off or the API is unreachable (the fetch layer falls back to the
 * static defaults, which carry an empty array).
 */

/** Server helper — reads live reward tiers, sorted ascending by threshold. */
export async function getRewardTiers(): Promise<RewardTier[]> {
  const settings = await fetchSiteSettings();
  return settings.rewardTiers;
}
