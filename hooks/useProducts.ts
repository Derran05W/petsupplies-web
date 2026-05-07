'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getProducts } from '@/lib/api/products';
import { type ProductFilters, type ProductListResponse } from '@/types/product';

/**
 * Client-side product list hook.
 *
 * The product listing page renders its initial data on the server, so this
 * hook is **not** used for the first paint. It is here so Phase 5+ can:
 *   - revalidate the listing without a full page reload after a mutation
 *     (e.g. add-to-cart updating an "x in stock" badge),
 *   - share the same query cache between the listing page and any
 *     side-panel pickers that surface products in the future.
 *
 * For the initial server fetch, call `getProducts(filters)` directly from
 * a server component.
 */
export function useProducts(
  filters: ProductFilters = {},
  options?: { enabled?: boolean },
): UseQueryResult<ProductListResponse, Error> {
  return useQuery<ProductListResponse, Error>({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export const productsQueryKey = (filters: ProductFilters = {}): unknown[] => [
  'products',
  filters,
];
