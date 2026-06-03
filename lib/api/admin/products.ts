import type { ProductImage } from '@/types/product';
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListResponse,
  StockState,
} from '@/types/admin';
import type { AdminProductCategory } from '@/types/admin-product-api';
import type {
  ApiAdminProduct,
  ApiAdminProductDeleteResponse,
  ApiAdminProductListResponse,
} from '@/types/admin-product-api';
import { ApiError, apiFetch } from '../client';
import {
  filterByStockState,
  mapApiListResponse,
  mapApiProduct,
  toCreateBody,
  toUpdateBody,
} from './product-mapper';
import { syncProductImages } from './product-images';

const DEFAULT_LIMIT = 20;

export interface AdminProductListOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: AdminProductCategory;
  active?: boolean;
  /** Applied client-side after fetch (API has no stock filter). */
  stockState?: StockState;
  accessToken?: string;
}

export interface AdminApiOptions {
  accessToken?: string;
}

function fetchOpts(accessToken?: string) {
  return accessToken
    ? { cache: 'no-store' as const, accessToken }
    : { cache: 'no-store' as const };
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export async function adminListProducts(
  options: AdminProductListOptions = {},
): Promise<AdminProductListResponse> {
  const {
    page = 1,
    limit = DEFAULT_LIMIT,
    search,
    category,
    active,
    stockState,
    accessToken,
  } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search && search.length > 0) params.set('q', search);
  if (category) params.set('category', category);
  if (active !== undefined) params.set('active', active ? 'true' : 'false');

  const data = await apiFetch<ApiAdminProductListResponse>(
    `/admin/products?${params.toString()}`,
    fetchOpts(accessToken),
  );
  const mapped = mapApiListResponse(data);
  if (stockState && stockState !== 'all') {
    return {
      ...mapped,
      products: filterByStockState(mapped.products, stockState),
    };
  }
  return mapped;
}

/* -------------------------------------------------------------------------- */
/* Get one                                                                    */
/* -------------------------------------------------------------------------- */

export async function adminGetProduct(
  id: string,
  options: AdminApiOptions = {},
): Promise<AdminProduct | null> {
  const { accessToken } = options;
  try {
    const product = await apiFetch<ApiAdminProduct>(
      `/admin/products/${encodeURIComponent(id)}`,
      fetchOpts(accessToken),
    );
    return mapApiProduct(product);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminCreateProduct(
  input: AdminProductInput,
  options: AdminApiOptions = {},
): Promise<AdminProduct> {
  const { accessToken } = options;
  const created = await apiFetch<ApiAdminProduct>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(toCreateBody(input)),
    ...fetchOpts(accessToken),
  });

  if (input.images.length > 0) {
    await syncProductImages(
      created.id,
      input.images,
      mapApiProduct(created).images,
      options,
    );
  }

  const refreshed = await adminGetProduct(created.id, options);
  return refreshed ?? mapApiProduct(created);
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminUpdateProduct(
  id: string,
  input: AdminProductInput,
  options: AdminApiOptions & { existingImages?: ProductImage[] } = {},
): Promise<AdminProduct> {
  const { accessToken, existingImages } = options;
  const updated = await apiFetch<ApiAdminProduct>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(toUpdateBody(input)),
      ...fetchOpts(accessToken),
    },
  );

  const prior = existingImages ?? mapApiProduct(updated).images;
  if (input.images.length > 0 || prior.length > 0) {
    await syncProductImages(id, input.images, prior, options);
  }

  const refreshed = await adminGetProduct(id, options);
  return refreshed ?? mapApiProduct(updated);
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminDeleteProduct(
  id: string,
  options: AdminApiOptions = {},
): Promise<ApiAdminProductDeleteResponse> {
  const { accessToken } = options;
  return apiFetch<ApiAdminProductDeleteResponse>(
    `/admin/products/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      ...fetchOpts(accessToken),
    },
  );
}
