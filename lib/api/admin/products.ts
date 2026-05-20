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
import { isBackendUnreachableError } from '../unreachable';
import { loadAdminProducts, saveAdminProducts } from '@/lib/admin/storage';
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
  /** Backend `limit` query param. */
  limit?: number;
  /** Backend `q` search param. */
  search?: string;
  category?: AdminProductCategory;
  /** Backend `active` filter (`true` / `false`). */
  active?: boolean;
  /** Applied client-side after fetch (API has no stock filter). */
  stockState?: StockState;
  accessToken?: string;
}

export interface AdminApiOptions {
  accessToken?: string;
}

let warnedAboutAdminProductsFallback = false;

function warnFallback(): void {
  if (warnedAboutAdminProductsFallback) return;
  warnedAboutAdminProductsFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[admin/products] backend unreachable — using localStorage for dev',
  );
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

  try {
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
  } catch (err) {
    if (isBackendUnreachableError(err)) {
      warnFallback();
      return localList({ page, limit, search, stockState });
    }
    throw err;
  }
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
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      if (isBackendUnreachableError(err)) {
        warnFallback();
        return loadAdminProducts().find((p) => p.id === id) ?? null;
      }
    }
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
  try {
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
  } catch (err) {
    if (isBackendUnreachableError(err)) {
      warnFallback();
      return localCreate(input);
    }
    throw err;
  }
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
  try {
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
  } catch (err) {
    if (isBackendUnreachableError(err)) {
      warnFallback();
      return localUpdate(id, input);
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function adminDeleteProduct(
  id: string,
  options: AdminApiOptions = {},
): Promise<ApiAdminProductDeleteResponse> {
  const { accessToken } = options;
  try {
    return await apiFetch<ApiAdminProductDeleteResponse>(
      `/admin/products/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        ...fetchOpts(accessToken),
      },
    );
  } catch (err) {
    if (isBackendUnreachableError(err)) {
      warnFallback();
      const products = loadAdminProducts();
      saveAdminProducts(products.filter((p) => p.id !== id));
      return { deleted: 'hard' };
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback                                                             */
/* -------------------------------------------------------------------------- */

function localList(opts: {
  page: number;
  limit: number;
  search?: string;
  stockState?: StockState;
}): AdminProductListResponse {
  const all = loadAdminProducts();
  const search = opts.search?.trim().toLowerCase() ?? '';

  let filtered = all.filter((product) => {
    if (search.length > 0) {
      const haystack =
        `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  filtered = filterByStockState(filtered, opts.stockState);

  const total = filtered.length;
  const pageSize = opts.limit;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, opts.page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    products: filtered.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

function localCreate(input: AdminProductInput): AdminProduct {
  const products = loadAdminProducts();
  const created: AdminProduct = {
    id: `prod_dev_${Date.now().toString(36)}`,
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    category: input.category,
    images: input.images,
    inStock: input.stockCount > 0,
    stockCount: input.stockCount,
    tags: input.tags,
    createdAt: new Date().toISOString(),
    isPublished: input.isPublished,
    imageUrl: input.images[0]?.url ?? null,
  };
  saveAdminProducts([created, ...products]);
  return created;
}

function localUpdate(id: string, input: AdminProductInput): AdminProduct {
  const products = loadAdminProducts();
  const target = products.find((p) => p.id === id);
  if (!target) throw new ApiError('Product not found', 404);
  const updated: AdminProduct = {
    ...target,
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    category: input.category,
    images: input.images,
    inStock: input.stockCount > 0,
    stockCount: input.stockCount,
    tags: input.tags,
    isPublished: input.isPublished,
    imageUrl: input.images[0]?.url ?? null,
  };
  saveAdminProducts(products.map((p) => (p.id === id ? updated : p)));
  return updated;
}
