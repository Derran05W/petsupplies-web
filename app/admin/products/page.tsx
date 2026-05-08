import Link from 'next/link';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { adminListProducts } from '@/lib/api/admin/products';
import type { StockState } from '@/types/admin';
import { PageHeader } from '@/components/account/PageHeader';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminProductTable } from '@/components/admin/products/AdminProductTable';
import { AdminProductsToolbar } from '@/components/admin/products/AdminProductsToolbar';
import { ProductsEmpty } from '@/components/admin/products/ProductsEmpty';

export const metadata: Metadata = {
  title: `Admin · Products · ${brand.name}`,
};

interface AdminProductsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    stock?: string;
  };
}

const STOCK_VALUES: StockState[] = ['all', 'in_stock', 'low', 'out'];

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseStock(raw: string | undefined): StockState {
  if (!raw) return 'all';
  return STOCK_VALUES.includes(raw as StockState) ? (raw as StockState) : 'all';
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const page = parsePage(searchParams.page);
  const search = searchParams.search?.trim() ?? '';
  const stockState = parseStock(searchParams.stock);

  const accessToken = await getServerAccessToken();
  const data = await adminListProducts({
    page,
    ...(search.length > 0 ? { search } : {}),
    ...(stockState !== 'all' ? { stockState } : {}),
    ...(accessToken ? { accessToken } : {}),
  });

  const filtersActive = search.length > 0 || stockState !== 'all';

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Products"
        description="Catalogue, pricing, and stock — everything that shows on the storefront."
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            <Plus size={14} aria-hidden />
            New product
          </Link>
        }
      />

      <AdminProductsToolbar />

      {data.products.length === 0 ? (
        <ProductsEmpty filtered={filtersActive} />
      ) : (
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
      )}
    </>
  );
}
