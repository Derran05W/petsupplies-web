import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api/client';
import {
  SITE_NAV_FALLBACK,
  type SiteNavPublic,
} from '@/lib/site/nav-fallbacks';

export const SITE_NAV_CACHE_TAG = 'site-nav';
const REVALIDATE_SECONDS = 300;

export const fetchSiteNav = cache(async (): Promise<SiteNavPublic> => {
  try {
    return await apiFetch<SiteNavPublic>('/site/nav', {
      next: { revalidate: REVALIDATE_SECONDS, tags: [SITE_NAV_CACHE_TAG] },
    });
  } catch (err) {
    if (err instanceof ApiError && (err.isNetworkError || err.status >= 500)) {
      return SITE_NAV_FALLBACK;
    }
    throw err;
  }
});

export async function fetchSiteNavForAdmin(
  accessToken?: string,
): Promise<SiteNavPublic> {
  return apiFetch<SiteNavPublic>('/site/nav', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
