import { cache } from 'react';
import type { Product } from '@/types/product';
import { ApiError, apiFetch } from '@/lib/api/client';
import { mapCatalogProduct } from '@/lib/api/product-mapper';

export const SITE_FEATURED_CACHE_TAG = 'site-featured';
const REVALIDATE_SECONDS = 300;

/** `/site/featured-products` returns catalog-shaped rows (`price`), not storefront `Product`. */
export function mapFeaturedProductsResponse(raw: unknown): Product[] {
  const rows = extractFeaturedProductRows(raw);
  return rows.map(mapCatalogProduct);
}

function extractFeaturedProductRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (
    raw &&
    typeof raw === 'object' &&
    Array.isArray((raw as { products?: unknown[] }).products)
  ) {
    return (raw as { products: unknown[] }).products;
  }
  return [];
}

export const fetchFeaturedProducts = cache(async (): Promise<Product[]> => {
  try {
    const raw = await apiFetch<unknown>('/site/featured-products', {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [SITE_FEATURED_CACHE_TAG],
      },
    });
    return mapFeaturedProductsResponse(raw);
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
  const raw = await apiFetch<unknown>('/site/featured-products', {
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return mapFeaturedProductsResponse(raw);
}
