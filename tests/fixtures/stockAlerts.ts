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
