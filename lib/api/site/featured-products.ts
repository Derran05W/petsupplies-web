import { cache } from 'react';
import type { Product } from '@/types/product';
import { ApiError, apiFetch } from '@/lib/api/client';

export const SITE_FEATURED_CACHE_TAG = 'site-featured';
const REVALIDATE_SECONDS = 300;

export const fetchFeaturedProducts = cache(async (): Promise<Product[]> => {
  try {
    return await apiFetch<Product[]>('/site/featured-products', {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [SITE_FEATURED_CACHE_TAG],
      },
    });
  } catch (err) {
    if (err instanceof ApiError && (err.isNetworkError || err.status >= 500)) {
      return [];
    }
    throw err;
  }
});

/** Admin preview — always fresh. */
export async function fetchFeaturedProductsForAdmin(
  accessToken?: string,
): Promise<Product[]> {
  return apiFetch<Product[]>('/site/featured-products', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
