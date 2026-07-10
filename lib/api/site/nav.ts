import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api/client';
import {
  SITE_NAV_FALLBACK,
  type SiteNavPublic,
} from '@/lib/site/nav-fallbacks';
import { isSupportedNavLink } from '@/lib/site/nav-utils';

export const SITE_NAV_CACHE_TAG = 'site-nav';
const REVALIDATE_SECONDS = 300;

/**
 * Drop admin-managed links that point at pet types the shop no longer
 * carries (fish, bird). Storefront-only — `fetchSiteNavForAdmin` stays
 * unfiltered so the admin console can still see and delete stale entries.
 */
function withSupportedLinks(nav: SiteNavPublic): SiteNavPublic {
  return {
    header: nav.header.filter((link) => isSupportedNavLink(link.href)),
    footer: nav.footer.map((column) => ({
      ...column,
      links: column.links.filter((link) => isSupportedNavLink(link.href)),
    })),
  };
}

export const fetchSiteNav = cache(async (): Promise<SiteNavPublic> => {
  try {
    const nav = await apiFetch<SiteNavPublic>('/site/nav', {
      next: { revalidate: REVALIDATE_SECONDS, tags: [SITE_NAV_CACHE_TAG] },
    });
    return withSupportedLinks(nav);
  } catch (err) {
    // Chrome data must never take the page down: any API failure — network,
    // 5xx, or a dead deployment answering 404 ("Application not found") —
    // falls back to the static defaults.
    if (err instanceof ApiError) {
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
