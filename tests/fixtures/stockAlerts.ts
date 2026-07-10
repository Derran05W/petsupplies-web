import { oneFeaturedProduct, outOfStockProduct } from './products';
import type { StockAlert } from '@/types/stock-alert';

export function sampleStockAlert(overrides?: Partial<StockAlert>): StockAlert {
  const product = oneFeaturedProduct();
  return {
    productId: product.id,
    product,
    createdAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

export function sampleStockAlertOutOfStock(
  overrides?: Partial<StockAlert>,
): StockAlert {
  const product = outOfStockProduct();
  return {
    productId: product.id,
    product,
    createdAt: '2026-03-02T12:00:00.000Z',
    ...overrides,
  };
}

/**
 * Real backend `StockAlertItemResponse` wire shape — nested minimal product
 * snapshot with `price` (cents), `active`, and `stock`. Used by the
 * lib/api/stockAlerts tests to exercise the wire → app mapper.
 */
export function sampleStockAlertApiItem(overrides?: Record<string, unknown>) {
  return {
    id: 'sa-1',
    createdAt: '2026-03-01T00:00:00.000Z',
    notifiedAt: null,
    product: {
      id: 'prod-1',
      name: 'Salmon Feast',
      slug: 'salmon-feast',
      price: 1299,
      active: true,
      stock: 5,
    },
    ...overrides,
  };
}

/** Backend `{ data: [...] }` paginated envelope for GET /users/me/stock-alerts. */
export function sampleStockAlertApiEnvelope() {
  return {
    data: [sampleStockAlertApiItem()],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  };
}
