import type { Product } from '@/types/product';
import type { WishlistItem, WishlistListResponse } from '@/types/wishlist';
import { ApiError, apiFetch } from './client';

export interface WishlistApiOptions {
  accessToken?: string;
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
  if (Array.isArray(raw)) {
    return raw as WishlistItem[];
  }
  if (
    raw &&
    typeof raw === 'object' &&
    'items' in raw &&
    Array.isArray((raw as WishlistListResponse).items)
  ) {
    return (raw as WishlistListResponse).items;
  }
  return [];
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
    return await apiFetch<WishlistItem>(BASE, {
      method: 'POST',
      body,
      ...(accessToken ? { accessToken } : {}),
    });
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
