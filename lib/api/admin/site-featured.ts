import type { Product } from '@/types/product';
import { apiFetch } from '@/lib/api/client';
import { mapFeaturedProductsResponse } from '@/lib/api/site/featured-products';
import type { AdminApiOptions } from './products';

export async function replaceFeaturedProducts(
  productIds: string[],
  options: AdminApiOptions = {},
): Promise<Product[]> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>('/admin/site/featured-products', {
    method: 'PUT',
    body: JSON.stringify({ productIds }),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
  return mapFeaturedProductsResponse(raw);
}
