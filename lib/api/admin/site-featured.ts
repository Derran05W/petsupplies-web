import type { Product } from '@/types/product';
import { apiFetch } from '@/lib/api/client';
import type { AdminApiOptions } from './products';

export async function replaceFeaturedProducts(
  productIds: string[],
  options: AdminApiOptions = {},
): Promise<Product[]> {
  const { accessToken } = options;
  return apiFetch<Product[]>('/admin/site/featured-products', {
    method: 'PUT',
    body: JSON.stringify({ productIds }),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}
