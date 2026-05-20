import { cache } from 'react';
import { ApiError, apiFetch } from '@/lib/api/client';
import type { StaticPagePublic, StaticPageSlug } from '@/types/site';

export const SITE_PAGES_CACHE_TAG = 'site-pages';
const REVALIDATE_SECONDS = 300;

/**
 * Public storefront read — 404 when unpublished or unknown slug.
 */
export const fetchSitePage = cache(
  async (slug: StaticPageSlug): Promise<StaticPagePublic | null> => {
    try {
      return await apiFetch<StaticPagePublic>(`/site/pages/${slug}`, {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [SITE_PAGES_CACHE_TAG],
        },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      throw err;
    }
  },
);
