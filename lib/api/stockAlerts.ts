import type { Product } from '@/types/product';
import type { StockAlert, StockAlertListPayload } from '@/types/stock-alert';
import { ApiError, apiFetch } from './client';

export interface StockAlertsApiOptions {
  accessToken?: string;
}

let warnedAboutStockAlertsFallback = false;

function warnFallback(): void {
  if (warnedAboutStockAlertsFallback) return;
  warnedAboutStockAlertsFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[stock-alerts] backend unreachable — empty list fallback for dev',
  );
}

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/** Canonical path per docs/backend-api-routes.md */
const BASE = '/users/me/stock-alerts';

/**
 * Normalize a single alert payload. Accepts camelCase `createdAt`
 * or snake_case `created_at`. Derives `productId` from the nested product when omitted.
 */
export function normalizeStockAlertRow(
  raw: unknown,
  fallbackProduct?: Product,
): StockAlert | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const product = (r.product as Product | undefined) ?? fallbackProduct;
  const productId =
    (typeof r.productId === 'string' ? r.productId : undefined) ?? product?.id;
  const createdRaw = r.createdAt ?? r.created_at;
  const createdAt =
    typeof createdRaw === 'string' ? createdRaw : new Date().toISOString();
  if (!product || !productId) return null;
  return { productId, product, createdAt };
}

function normalizeListPayload(raw: unknown): StockAlert[] {
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (
    raw &&
    typeof raw === 'object' &&
    'items' in raw &&
    Array.isArray((raw as StockAlertListPayload).items)
  ) {
    rows = (raw as StockAlertListPayload).items!;
  }
  return rows
    .map((row) => normalizeStockAlertRow(row))
    .filter((x): x is StockAlert => x !== null);
}

/**
 * GET active stock alerts for the current user.
 * Network failures → [] (wishlist-aligned dev ergonomics).
 */
export async function listStockAlerts(
  options: StockAlertsApiOptions = {},
): Promise<StockAlert[]> {
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

export interface CreateStockAlertOptions extends StockAlertsApiOptions {
  /** Used when the server returns 409 (duplicate) or for network synthesize. */
  product?: Product;
}

/**
 * POST `{ productId }`. Idempotent: 409 with `product` snapshot succeeds with a synthetic row.
 */
export async function createStockAlert(
  productId: string,
  options: CreateStockAlertOptions = {},
): Promise<StockAlert> {
  const { accessToken, product } = options;
  const body = JSON.stringify({ productId });
  try {
    const raw = await apiFetch<unknown>(BASE, {
      method: 'POST',
      body,
      ...(accessToken ? { accessToken } : {}),
    });
    const fromServer = normalizeStockAlertRow(raw, product ?? undefined);
    if (fromServer) return fromServer;
    if (product) {
      return {
        productId,
        product,
        createdAt: new Date().toISOString(),
      };
    }
    throw new ApiError('Unexpected stock-alert create response', 0);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && product) {
      return {
        productId,
        product,
        createdAt: new Date().toISOString(),
      };
    }
    if (isNetwork(err)) {
      warnFallback();
      if (!product) {
        throw new ApiError('Stock-alert create fallback requires product', 0);
      }
      return {
        productId,
        product,
        createdAt: new Date().toISOString(),
      };
    }
    throw err;
  }
}

/**
 * DELETE alert — idempotent; 404 swallowed (wishlist-aligned).
 */
export async function deleteStockAlert(
  productId: string,
  options: StockAlertsApiOptions = {},
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
