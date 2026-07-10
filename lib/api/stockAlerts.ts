import type { Product } from '@/types/product';
import type { StockAlert } from '@/types/stock-alert';
import { ApiError, apiFetch } from './client';
import { mapCatalogProduct } from './product-mapper';

export interface StockAlertsApiOptions {
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers. Backend `StockAlertItemResponse` nests a minimal      */
/* product snapshot ({ id, name, slug, price, active, stock }) and the list is */
/* a `{ data: [...] }` envelope.                                               */
/* -------------------------------------------------------------------------- */

interface ApiStockAlertProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  active: boolean;
  stock: number;
}

function mapStockAlertProduct(p: ApiStockAlertProduct): Product {
  return mapCatalogProduct({
    ...p,
    imageUrl: null,
    images: [],
    inStock: typeof p.stock === 'number' ? p.stock > 0 : Boolean(p.active),
    description: '',
    category: '',
    tags: [],
    avgRating: null,
    reviewCount: 0,
    createdAt: '',
  });
}

function isApiStockAlertProduct(raw: unknown): raw is ApiStockAlertProduct {
  // The wire snapshot carries `price` but not `priceCents`; an already-app
  // `Product` has `priceCents` and is used as-is.
  return (
    !!raw && typeof raw === 'object' && !('priceCents' in raw) && 'price' in raw
  );
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
  const rawProduct = r.product;
  let product: Product | undefined;
  if (isApiStockAlertProduct(rawProduct)) {
    product = mapStockAlertProduct(rawProduct);
  } else if (rawProduct && typeof rawProduct === 'object') {
    product = rawProduct as Product;
  } else {
    product = fallbackProduct;
  }
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
  } else if (raw && typeof raw === 'object') {
    // Backend paginated envelope is `{ data: [...] }`; `items` tolerated too.
    for (const key of ['data', 'items'] as const) {
      const value = (raw as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        rows = value;
        break;
      }
    }
  }
  return rows
    .map((row) => normalizeStockAlertRow(row))
    .filter((x): x is StockAlert => x !== null);
}

/** GET active stock alerts for the current user. */
export async function listStockAlerts(
  options: StockAlertsApiOptions = {},
): Promise<StockAlert[]> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>(
    BASE,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return normalizeListPayload(raw);
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
    throw err;
  }
}
