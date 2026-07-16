import { cache } from 'react';
import type { CategoryStripItem } from '@/types/site';
import { ApiError, apiFetch } from '@/lib/api/client';
import { isE2eSiteChromeFixtureEnabled } from '@/lib/api/e2e/site-chrome-fixture';
import { CATEGORY_STRIP_FALLBACK } from '@/lib/site/category-strip-fallbacks';

export const SITE_CATEGORY_STRIP_CACHE_TAG = 'site-category-strip';
const REVALIDATE_SECONDS = 300;

export const fetchCategoryStrip = cache(
  async (): Promise<CategoryStripItem[]> => {
    if (isE2eSiteChromeFixtureEnabled()) {
      return CATEGORY_STRIP_FALLBACK;
    }
    try {
      return await apiFetch<CategoryStripItem[]>('/site/category-strip', {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [SITE_CATEGORY_STRIP_CACHE_TAG],
        },
      });
    } catch (err) {
      // Chrome data must never take the page down: any API failure —
      // network, 5xx, or a dead deployment answering 404 — falls back to
      // the static defaults.
      if (err instanceof ApiError) {
        return CATEGORY_STRIP_FALLBACK;
      }
      throw err;
    }
  },
);

export async function fetchCategoryStripForAdmin(
  accessToken?: string,
): Promise<CategoryStripItem[]> {
  return apiFetch<CategoryStripItem[]>('/site/category-strip', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
