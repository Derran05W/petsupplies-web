import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminOrdersToolbar } from '@/components/admin/orders/AdminOrdersToolbar';
import { AdminTableSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import {
  AdminOrdersSection,
  parseAdminOrdersPage,
  parseAdminOrdersStatus,
} from '@/components/admin/sections/AdminOrdersSection';

export const metadata: Metadata = {
  title: `Admin · Orders · ${brand.name}`,
};

interface AdminOrdersPageProps {
  searchParams: {
    page?: string;
    status?: string;
    selected?: string;
  };
}

export default function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const page = parseAdminOrdersPage(searchParams.page);
  const status = parseAdminOrdersStatus(searchParams.status);
  const selectedId = searchParams.selected ?? null;
  const suspenseKey = JSON.stringify({ page, status, selectedId });

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Orders"
        description="Update fulfilment status and add tracking details for shipped orders."
      />
      <AdminOrdersToolbar />
      <Suspense
        key={suspenseKey}
        fallback={
          <AdminTableSkeleton
            caption="Admin orders list"
            columns={['Order', 'Customer', 'Status', 'Total', 'Actions']}
            hiddenFromMd={[1]}
          />
        }
      >
        <AdminOrdersSection
          page={page}
          status={status}
          selectedId={selectedId}
        />
      </Suspense>
    </>
  );
}
