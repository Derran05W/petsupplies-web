import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api/client';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';
import type { SiteSettingsPublic } from '@/types/site';

export const SITE_SETTINGS_CACHE_TAG = 'site-settings';
const REVALIDATE_SECONDS = 300;

/**
 * Storefront read — ISR with on-demand revalidation via
 * `POST /api/internal/revalidate`.
 */
export const fetchSiteSettings = cache(
  async (): Promise<SiteSettingsPublic> => {
    try {
      return await apiFetch<SiteSettingsPublic>('/site/settings', {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [SITE_SETTINGS_CACHE_TAG],
        },
      });
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.isNetworkError || err.status >= 500)
      ) {
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
  return apiFetch<SiteSettingsPublic>('/site/settings', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
