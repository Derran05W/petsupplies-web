import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminProductsToolbar } from '@/components/admin/products/AdminProductsToolbar';
import { AdminTableSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import {
  AdminProductsSection,
  parseAdminProductsPage,
  parseAdminProductsStock,
} from '@/components/admin/sections/AdminProductsSection';

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

export default function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const page = parseAdminProductsPage(searchParams.page);
  const search = searchParams.search?.trim() ?? '';
  const stockState = parseAdminProductsStock(searchParams.stock);
  const suspenseKey = JSON.stringify({ page, search, stockState });

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
      <Suspense
        key={suspenseKey}
        fallback={
          <AdminTableSkeleton
            caption="Admin products list"
            columns={[
              'Product',
              'Category',
              'Price',
              'Stock',
              'Status',
              'Actions',
            ]}
            hiddenFromSm={[4]}
          />
        }
      >
        <AdminProductsSection
          page={page}
          search={search}
          stockState={stockState}
        />
      </Suspense>
    </>
  );
}
