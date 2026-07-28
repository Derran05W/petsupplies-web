import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api/client';
import { isE2eSiteChromeFixtureEnabled } from '@/lib/api/e2e/site-chrome-fixture';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';
import type { SiteSettingsPublic } from '@/types/site';

export const SITE_SETTINGS_CACHE_TAG = 'site-settings';
const REVALIDATE_SECONDS = 300;

/**
 * Tolerate an older API deployment that predates `rewardTiers`: coerce a
 * missing/invalid wire field to an empty array (feature hidden) and keep the
 * ascending-by-threshold ordering the storefront relies on.
 */
function normalizeSiteSettings(
  settings: SiteSettingsPublic,
): SiteSettingsPublic {
  const rewardTiers = Array.isArray(settings.rewardTiers)
    ? [...settings.rewardTiers].sort(
        (a, b) => a.thresholdCents - b.thresholdCents,
      )
    : [];
  return { ...settings, rewardTiers };
}

/**
 * Storefront read — ISR with on-demand revalidation via
 * `POST /api/internal/revalidate`.
 */
export const fetchSiteSettings = cache(
  async (): Promise<SiteSettingsPublic> => {
    if (isE2eSiteChromeFixtureEnabled()) {
      return SITE_SETTINGS_FALLBACK;
    }
    try {
      const settings = await apiFetch<SiteSettingsPublic>('/site/settings', {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [SITE_SETTINGS_CACHE_TAG],
        },
      });
      return normalizeSiteSettings(settings);
    } catch (err) {
      // Chrome data must never take the page down: any API failure —
      // network, 5xx, or a dead deployment answering 404 — falls back to
      // the static defaults.
      if (err instanceof ApiError) {
        return SITE_SETTINGS_FALLBACK;
      }
      throw err;
    }
  },
);

/** Admin preview / edit — always fresh. */
export async function fetchSiteSettingsForAdmin(
  accessToken?: string,
): Promise<SiteSettingsPublic> {
  const settings = await apiFetch<SiteSettingsPublic>('/site/settings', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return normalizeSiteSettings(settings);
}
