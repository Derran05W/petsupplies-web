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
    deleted?: string;
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
            className="inline-flex items-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            <Plus size={14} aria-hidden />
            New product
          </Link>
        }
      />
      {searchParams.deleted === 'soft' && (
        <p
          role="status"
          className="mb-4 rounded-tile border border-line bg-panel px-4 py-3 font-body text-sm text-ink-secondary"
        >
          This product has order or subscription history, so it was archived
          instead of permanently deleted — it&apos;s now a Draft and hidden from
          the storefront.
        </p>
      )}
      {searchParams.deleted === 'hard' && (
        <p
          role="status"
          className="mb-4 rounded-tile border border-line bg-panel px-4 py-3 font-body text-sm text-ink-secondary"
        >
          Product permanently deleted.
        </p>
      )}
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
