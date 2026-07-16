import { cache } from 'react';
import type { Product } from '@/types/product';
import { ApiError, apiFetch } from '@/lib/api/client';
import { listE2eCatalogProducts } from '@/lib/api/e2e/catalog-fixture';
import { isE2eSiteChromeFixtureEnabled } from '@/lib/api/e2e/site-chrome-fixture';
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
  /** Fixture products (not `[]`) so the homepage smoke can assert real cards. */
  if (isE2eSiteChromeFixtureEnabled()) {
    return listE2eCatalogProducts();
  }
  try {
    const raw = await apiFetch<unknown>('/site/featured-products', {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [SITE_FEATURED_CACHE_TAG],
      },
    });
    return mapFeaturedProductsResponse(raw);
  } catch (err) {
    // Chrome data must never take the page down: any API failure — network,
    // 5xx, or a dead deployment answering 404 — degrades to an empty grid.
    if (err instanceof ApiError) {
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
