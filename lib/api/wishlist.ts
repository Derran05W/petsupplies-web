import type { Product } from '@/types/product';
import type { WishlistItem, WishlistListResponse } from '@/types/wishlist';
import { ApiError, apiFetch } from './client';

export interface WishlistApiOptions {
  accessToken?: string;
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

/** GET wishlist for the current user. */
export async function listWishlist(
  options: WishlistApiOptions = {},
): Promise<WishlistItem[]> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>(
    BASE,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return normalizeListPayload(raw);
}

export interface AddWishlistOptions extends WishlistApiOptions {
  /** Used when the server returns 409 (already saved) to synthesise the row. */
  product?: Product;
}

/** POST `{ productId }` — idempotent; 409 treated as success when `product` is passed. */
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
    throw err;
  }
}

/** DELETE wishlist row — idempotent; 404 swallowed. */
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
    throw err;
  }
}
