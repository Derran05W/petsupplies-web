import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListResponse,
  StockState,
} from '@/types/admin';
import { ApiError, apiFetch } from '../client';
import { loadAdminProducts, saveAdminProducts } from '@/lib/admin/storage';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/config';

const DEFAULT_PAGE_SIZE = 20;

export interface AdminProductListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
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

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export async function adminListProducts(
  options: AdminProductListOptions = {},
): Promise<AdminProductListResponse> {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search,
    stockState,
    accessToken,
  } = options;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (search && search.length > 0) params.set('search', search);
  if (stockState && stockState !== 'all') params.set('stock', stockState);

  try {
    return await apiFetch<AdminProductListResponse>(
      `/admin/products?${params.toString()}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      return localList({ page, pageSize, search, stockState });
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
    return await apiFetch<AdminProduct>(
      `/admin/products/${encodeURIComponent(id)}`,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      if (err.isNetworkError) {
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
    return await apiFetch<AdminProduct>(
      '/admin/products',
      accessToken
        ? { method: 'POST', body: JSON.stringify(input), accessToken }
        : { method: 'POST', body: JSON.stringify(input) },
    );
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const products = loadAdminProducts();
      const created: AdminProduct = {
        id: `prod_dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        slug: input.slug,
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        ...(input.compareAtPriceCents !== undefined
          ? { compareAtPriceCents: input.compareAtPriceCents }
          : {}),
        category: input.category,
        petType: input.petType,
        images: input.images,
        ...(input.nutritionalInfo
          ? { nutritionalInfo: input.nutritionalInfo }
          : {}),
        inStock: input.stockCount > 0,
        stockCount: input.stockCount,
        tags: input.tags,
        createdAt: new Date().toISOString(),
        isPublished: input.isPublished,
      };
      saveAdminProducts([created, ...products]);
      return created;
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
  options: AdminApiOptions = {},
): Promise<AdminProduct> {
  const { accessToken } = options;
  try {
    return await apiFetch<AdminProduct>(
      `/admin/products/${encodeURIComponent(id)}`,
      accessToken
        ? { method: 'PATCH', body: JSON.stringify(input), accessToken }
        : { method: 'PATCH', body: JSON.stringify(input) },
    );
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const products = loadAdminProducts();
      const target = products.find((p) => p.id === id);
      if (!target) throw new ApiError('Product not found', 404);
      const updated: AdminProduct = {
        ...target,
        slug: input.slug,
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        ...(input.compareAtPriceCents !== undefined
          ? { compareAtPriceCents: input.compareAtPriceCents }
          : { compareAtPriceCents: undefined }),
        category: input.category,
        petType: input.petType,
        images: input.images,
        ...(input.nutritionalInfo
          ? { nutritionalInfo: input.nutritionalInfo }
          : { nutritionalInfo: undefined }),
        inStock: input.stockCount > 0,
        stockCount: input.stockCount,
        tags: input.tags,
        isPublished: input.isPublished,
      };
      saveAdminProducts(products.map((p) => (p.id === id ? updated : p)));
      return updated;
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
): Promise<void> {
  const { accessToken } = options;
  try {
    await apiFetch<void>(
      `/admin/products/${encodeURIComponent(id)}`,
      accessToken ? { method: 'DELETE', accessToken } : { method: 'DELETE' },
    );
    return;
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const products = loadAdminProducts();
      saveAdminProducts(products.filter((p) => p.id !== id));
      return;
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Local fallback                                                             */
/* TODO(phase 8): remove once backend phase 8 admin endpoints are on staging. */
/* -------------------------------------------------------------------------- */

function localList(opts: {
  page: number;
  pageSize: number;
  search?: string;
  stockState?: StockState;
}): AdminProductListResponse {
  const all = loadAdminProducts();
  const search = opts.search?.trim().toLowerCase() ?? '';

  const filtered = all.filter((product) => {
    if (search.length > 0) {
      const haystack =
        `${product.name} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (opts.stockState && opts.stockState !== 'all') {
      const isOut = product.stockCount <= 0;
      const isLow = !isOut && product.stockCount <= LOW_STOCK_THRESHOLD;
      if (opts.stockState === 'out' && !isOut) return false;
      if (opts.stockState === 'low' && !isLow) return false;
      if (opts.stockState === 'in_stock' && (isOut || isLow)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / opts.pageSize));
  const safePage = Math.min(Math.max(1, opts.page), totalPages);
  const start = (safePage - 1) * opts.pageSize;
  return {
    products: filtered.slice(start, start + opts.pageSize),
    total,
    page: safePage,
    pageSize: opts.pageSize,
    totalPages,
  };
}
