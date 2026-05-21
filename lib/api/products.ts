import { cache } from 'react';
import {
  type PetType,
  type Product,
  type ProductFilters,
  type ProductListResponse,
  type ProductSort,
} from '@/types/product';
import { ApiError, apiFetch } from './client';
import {
  mapCatalogProduct,
  mapCatalogProductListResponse,
  type ApiCatalogProduct,
  type ApiCatalogProductListResponse,
} from './product-mapper';
import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';

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
 *
 * Falls back to filtering `FEATURED_PRODUCTS` when the backend is
 * unreachable so the UI never crashes during local dev / preview.
 * TODO(phase 4): remove fallback once backend phase 4 is on staging.
 */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductListResponse> {
  try {
    const raw = await apiFetch<
      ApiCatalogProductListResponse | ProductListResponse
    >(`/products${toQueryString(filters)}`, { cache: 'no-store' });
    if (
      raw &&
      typeof raw === 'object' &&
      'products' in raw &&
      typeof (raw as ApiCatalogProductListResponse).limit === 'number'
    ) {
      return mapCatalogProductListResponse(
        raw as ApiCatalogProductListResponse,
      );
    }
    const legacy = raw as ProductListResponse;
    return {
      ...legacy,
      products: (legacy.products ?? []).map(mapCatalogProduct),
    };
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      return localFilter(filters);
    }
    throw err;
  }
}

/**
 * Fetch a single product by slug. Returns `null` if the product is not
 * found OR if the backend is unreachable and no matching placeholder
 * exists. Pages should call `notFound()` on `null`.
 *
 * Wrapped in `React.cache` so `generateMetadata` and the page's default
 * export share a single underlying request — with `cache: 'no-store'`,
 * Next does not dedupe the underlying `fetch` automatically.
 *
 * TODO(phase 4): remove fallback once backend phase 4 is on staging.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const raw = await apiFetch<ApiCatalogProduct | Product>(
        `/products/${encodeURIComponent(slug)}`,
        { cache: 'no-store' },
      );
      return mapCatalogProduct(raw);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) return null;
        if (err.isNetworkError) {
          return FEATURED_PRODUCTS.find((p) => p.slug === slug) ?? null;
        }
      }
      throw err;
    }
  },
);

/**
 * Fetch products related to a given pet type, excluding one slug. Used by
 * the "You might also like" row on the product detail page.
 * TODO(phase 4): remove fallback once backend phase 4 is on staging.
 */
export async function getRelatedProducts(
  petType: PetType,
  excludeSlug: string,
): Promise<Product[]> {
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
    return response.products
      .filter((p) => p.petType === petType)
      .filter((p) => p.slug !== excludeSlug)
      .slice(0, RELATED_LIMIT);
  } catch (err) {
    if (err instanceof ApiError && err.isNetworkError) {
      return FEATURED_PRODUCTS.filter(
        (p) => p.petType === petType && p.slug !== excludeSlug,
      ).slice(0, RELATED_LIMIT);
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback — runs only when the backend is unreachable.                */
/* TODO(phase 4): remove once backend phase 4 is on staging.                  */
/* -------------------------------------------------------------------------- */

function compareBySort(sort: ProductSort) {
  return (a: Product, b: Product): number => {
    switch (sort) {
      case 'price_asc':
        return a.priceCents - b.priceCents;
      case 'price_desc':
        return b.priceCents - a.priceCents;
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'relevance':
      default:
        return 0;
    }
  };
}

function localFilter(filters: ProductFilters): ProductListResponse {
  const search = filters.search?.trim().toLowerCase() ?? '';

  const matches = FEATURED_PRODUCTS.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.petType && p.petType !== filters.petType) return false;
    if (
      typeof filters.minPriceCents === 'number' &&
      p.priceCents < filters.minPriceCents
    )
      return false;
    if (
      typeof filters.maxPriceCents === 'number' &&
      p.priceCents > filters.maxPriceCents
    )
      return false;
    if (search.length > 0) {
      const haystack =
        `${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const sorted = [...matches].sort(compareBySort(filters.sort ?? 'relevance'));

  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const products = sorted.slice(start, start + pageSize);

  return { products, total, page: safePage, pageSize, totalPages };
}
