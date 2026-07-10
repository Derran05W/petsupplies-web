import type { Product } from '@/types/product';
import type { WishlistItem } from '@/types/wishlist';
import { ApiError, apiFetch } from './client';
import { mapCatalogProduct } from './product-mapper';

export interface WishlistApiOptions {
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers. Backend `WishlistItemResponse` nests a minimal        */
/* product snapshot ({ id, name, slug, price, active, images }) and the list   */
/* is a `{ data: [...] }` envelope. The snapshot has no stock field, so        */
/* availability is inferred from `active`.                                     */
/* -------------------------------------------------------------------------- */

interface ApiWishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  active: boolean;
  images: {
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
}

function mapWishlistProduct(p: ApiWishlistProduct): Product {
  return mapCatalogProduct({
    ...p,
    imageUrl: null,
    stock: p.active ? 1 : 0,
    inStock: p.active,
    description: '',
    category: '',
    tags: [],
    avgRating: null,
    reviewCount: 0,
    createdAt: '',
    images: (p.images ?? []).map((img) => ({ ...img, productId: p.id })),
  });
}

/** Returns null when the row is not a recognisable wishlist item. */
function mapWishlistItem(
  raw: unknown,
  fallbackProduct?: Product,
): WishlistItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const addedRaw = r.addedAt ?? r.added_at;
  const addedAt =
    typeof addedRaw === 'string' ? addedRaw : new Date().toISOString();
  const rawProduct = r.product;
  let product: Product | undefined;
  if (rawProduct && typeof rawProduct === 'object') {
    product = mapWishlistProduct(rawProduct as ApiWishlistProduct);
  } else {
    product = fallbackProduct;
  }
  if (!product) return null;
  return { product, addedAt };
}

let warnedAboutWishlistFallback = false;

function warnFallback(): void {
  if (warnedAboutWishlistFallback) return;
  warnedAboutWishlistFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[wishlist] backend unreachable — optimistic empty list for dev',
  );
}

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/** Canonical path per docs/backend-api-routes.md */
const BASE = '/users/me/wishlist';

function normalizeListPayload(raw: unknown): WishlistItem[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === 'object') {
    // Backend paginated envelope is `{ data: [...] }`; `items` kept for fallbacks.
    for (const key of ['data', 'items'] as const) {
      const value = (raw as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        rows = value;
        break;
      }
    }
  }
  return rows
    .map((row) => mapWishlistItem(row))
    .filter((x): x is WishlistItem => x !== null);
}

/**
 * GET wishlist for the current user.
 *
 * **Backend-not-ready fallback:** empty array on network errors.
 * TODO(phase 14): remove fallback once backend phase 14 is verified on staging.
 */
export async function listWishlist(
  options: WishlistApiOptions = {},
): Promise<WishlistItem[]> {
  const { accessToken } = options;
  try {
    const raw = await apiFetch<unknown>(
      BASE,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return normalizeListPayload(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      return [];
    }
    throw err;
  }
}

export interface AddWishlistOptions extends WishlistApiOptions {
  /** Used when the server returns 409 (already saved) to synthesise the row. */
  product?: Product;
}

/**
 * POST `{ productId }` — idempotent; 409 treated as success when `product` is passed.
 *
 * **Network fallback:** returns a synthetic row so optimistic UI can settle.
 * TODO(phase 14): remove fallback once backend phase 14 is verified on staging.
 */
export async function addWishlistItem(
  productId: string,
  options: AddWishlistOptions = {},
): Promise<WishlistItem> {
  const { accessToken, product } = options;
  const body = JSON.stringify({ productId });
  try {
    const raw = await apiFetch<unknown>(BASE, {
      method: 'POST',
      body,
      ...(accessToken ? { accessToken } : {}),
    });
    const mapped = mapWishlistItem(raw, product);
    if (mapped) {
      // Prefer the caller's richer product snapshot over the minimal wire one.
      return product ? { product, addedAt: mapped.addedAt } : mapped;
    }
    if (product) {
      return { product, addedAt: new Date().toISOString() };
    }
    throw new ApiError('Unexpected wishlist add response', 0);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && product) {
      return {
        product,
        addedAt: new Date().toISOString(),
      };
    }
    if (isNetwork(err)) {
      warnFallback();
      if (!product) {
        throw new ApiError(
          'Wishlist add fallback requires product snapshot',
          0,
        );
      }
      return {
        product,
        addedAt: new Date().toISOString(),
      };
    }
    throw err;
  }
}

/**
 * DELETE wishlist row — idempotent; 404 swallowed.
 *
 * **Network fallback:** no-op success for offline dev.
 * TODO(phase 14): remove fallback once backend phase 14 is verified on staging.
 */
export async function removeWishlistItem(
  productId: string,
  options: WishlistApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  const path = `${BASE}/${encodeURIComponent(productId)}`;
  try {
    await apiFetch<void>(
      path,
      accessToken ? { method: 'DELETE', accessToken } : { method: 'DELETE' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return;
    }
    if (isNetwork(err)) {
      warnFallback();
      return;
    }
    throw err;
  }
}
