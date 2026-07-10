import { cache } from 'react';
import {
  type PetType,
  type Product,
  type ProductFilters,
  type ProductListResponse,
} from '@/types/product';
import { ApiError, apiFetch } from './client';
import {
  mapCatalogProduct,
  mapCatalogProductListResponse,
  type ApiCatalogProduct,
  type ApiCatalogProductListResponse,
} from './product-mapper';
import {
  filterAndPaginateProducts,
  CLIENT_FILTER_PAGE_SIZE,
  needsClientSideProductFilter,
} from '@/lib/products/filter-products';
import {
  getE2eCatalogProduct,
  isE2eCatalogFixtureEnabled,
  listE2eCatalogProducts,
} from './e2e/catalog-fixture';

const DEFAULT_PAGE_SIZE = 12;
const RELATED_LIMIT = 4;

function toQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.search && filters.search.length > 0) {
    params.set('q', filters.search);
  }
  if (typeof filters.minPriceCents === 'number') {
    params.set('minPrice', String(filters.minPriceCents));
  }
  if (typeof filters.maxPriceCents === 'number') {
    params.set('maxPrice', String(filters.maxPriceCents));
  }
  if (filters.sort && filters.sort !== 'relevance') {
    params.set('sort', filters.sort);
  }
  if (filters.page) params.set('page', String(filters.page));
  params.set('limit', String(filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const qs = params.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

/**
 * List products. Server-side callers receive fresh data on every request
 * (`cache: 'no-store'`); Phase 9 can introduce per-route revalidation.
 */
function mapProductListResponse(
  raw: ApiCatalogProductListResponse | ProductListResponse,
): ProductListResponse {
  if (
    raw &&
    typeof raw === 'object' &&
    'products' in raw &&
    typeof (raw as ApiCatalogProductListResponse).limit === 'number'
  ) {
    return mapCatalogProductListResponse(raw as ApiCatalogProductListResponse);
  }

  const legacy = raw as ProductListResponse;
  return {
    ...legacy,
    products: (legacy.products ?? []).map(mapCatalogProduct),
  };
}

async function fetchCatalogForClientFiltering(
  filters: ProductFilters,
): Promise<Product[]> {
  if (isE2eCatalogFixtureEnabled()) {
    return listE2eCatalogProducts();
  }

  const apiFilters: ProductFilters = {
    minPriceCents: filters.minPriceCents,
    maxPriceCents: filters.maxPriceCents,
    sort: filters.sort,
    pageSize: CLIENT_FILTER_PAGE_SIZE,
  };

  const products: Product[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (products.length < total) {
    const raw = await apiFetch<
      ApiCatalogProductListResponse | ProductListResponse
    >(`/products${toQueryString({ ...apiFilters, page })}`, {
      cache: 'no-store',
    });
    const mapped = mapProductListResponse(raw);
    products.push(...mapped.products);
    total = mapped.total;
    if (mapped.products.length === 0) break;
    page += 1;
    if (page > 50) break;
  }

  return products;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductListResponse> {
  if (isE2eCatalogFixtureEnabled()) {
    return filterAndPaginateProducts(listE2eCatalogProducts(), filters);
  }

  if (needsClientSideProductFilter(filters)) {
    const products = await fetchCatalogForClientFiltering(filters);
    return filterAndPaginateProducts(products, filters);
  }

  const raw = await apiFetch<
    ApiCatalogProductListResponse | ProductListResponse
  >(`/products${toQueryString(filters)}`, { cache: 'no-store' });

  return mapProductListResponse(raw);
}

/** When E2E_STOCK_ALERT_FIXTURE=1, force one slug OOS so Playwright can exercise notify UI. */
function applyE2eOutOfStockOverride(slug: string, product: Product): Product {
  if (process.env.E2E_STOCK_ALERT_FIXTURE !== '1') return product;
  const oosSlug = process.env.E2E_OOS_PRODUCT_SLUG?.trim();
  if (!oosSlug || slug !== oosSlug) return product;
  return { ...product, inStock: false, stockCount: 0 };
}

/**
 * Fetch a single product by slug. Returns `null` on 404 — pages should call `notFound()`.
 *
 * Wrapped in `React.cache` so `generateMetadata` and the page's default
 * export share a single underlying request — with `cache: 'no-store'`,
 * Next does not dedupe the underlying `fetch` automatically.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    if (isE2eCatalogFixtureEnabled()) {
      const product = getE2eCatalogProduct(slug);
      return product ? applyE2eOutOfStockOverride(slug, product) : null;
    }

    try {
      const raw = await apiFetch<ApiCatalogProduct | Product>(
        `/products/${encodeURIComponent(slug)}`,
        { cache: 'no-store' },
      );
      return applyE2eOutOfStockOverride(slug, mapCatalogProduct(raw));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
);

function pickRelated(
  products: Product[],
  petType: PetType,
  excludeSlug: string,
): Product[] {
  return products
    .filter((p) => p.petType === petType)
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, RELATED_LIMIT);
}

/**
 * Fetch products related to a given pet type, excluding one slug. Used by
 * the "You might also like" row on the product detail page.
 */
export async function getRelatedProducts(
  petType: PetType,
  excludeSlug: string,
): Promise<Product[]> {
  if (isE2eCatalogFixtureEnabled()) {
    return pickRelated(listE2eCatalogProducts(), petType, excludeSlug);
  }

  try {
    const raw = await apiFetch<
      ApiCatalogProductListResponse | ProductListResponse
    >(`/products?limit=${RELATED_LIMIT + 5}`, { cache: 'no-store' });
    const response =
      raw &&
      typeof raw === 'object' &&
      'limit' in raw &&
      typeof (raw as ApiCatalogProductListResponse).limit === 'number'
        ? mapCatalogProductListResponse(raw as ApiCatalogProductListResponse)
        : {
            products: ((raw as ProductListResponse).products ?? []).map(
              mapCatalogProduct,
            ),
            total: 0,
            page: 1,
            pageSize: RELATED_LIMIT + 5,
            totalPages: 1,
          };
    return pickRelated(response.products, petType, excludeSlug);
  } catch (err) {
    // Auxiliary row: a failing catalogue fetch must hide the recommendations,
    // never take down the whole product page.
    if (err instanceof ApiError) return [];
    throw err;
  }
}
