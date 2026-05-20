import { adminListProducts } from '@/lib/api/admin/products';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import type { StockState } from '@/types/admin';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { AdminProductTable } from '@/components/admin/products/AdminProductTable';
import { ProductsEmpty } from '@/components/admin/products/ProductsEmpty';
import { AdminSectionError } from './AdminSectionError';

const STOCK_VALUES: StockState[] = ['all', 'in_stock', 'low', 'out'];

export function parseAdminProductsPage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseAdminProductsStock(raw: string | undefined): StockState {
  if (!raw) return 'all';
  return STOCK_VALUES.includes(raw as StockState) ? (raw as StockState) : 'all';
}

interface AdminProductsSectionProps {
  page: number;
  search: string;
  stockState: StockState;
}

export async function AdminProductsSection({
  page,
  search,
  stockState,
}: AdminProductsSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const data = await adminListProducts({
      page,
      ...(search.length > 0 ? { search } : {}),
      ...(stockState !== 'all' ? { stockState } : {}),
      ...opts,
    });

    const filtersActive = search.length > 0 || stockState !== 'all';

    if (data.products.length === 0) {
      return <ProductsEmpty filtered={filtersActive} />;
    }

    return (
      <>
        <AdminProductTable products={data.products} />
        <OrdersPagination
          currentPage={data.page}
          totalPages={data.totalPages}
          basePath="/admin/products"
          extraQuery={{
            search: search.length > 0 ? search : undefined,
            stock: stockState !== 'all' ? stockState : undefined,
          }}
        />
      </>
    );
  } catch (err) {
    return <AdminSectionError err={err} fallback="Failed to load products." />;
  }
}
