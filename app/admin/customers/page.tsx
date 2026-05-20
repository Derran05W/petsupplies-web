import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { CustomerSearchField } from '@/components/admin/customers/CustomerSearchField';
import { AdminTableSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import {
  AdminCustomersSection,
  parseAdminCustomersPage,
} from '@/components/admin/sections/AdminCustomersSection';

export const metadata: Metadata = {
  title: `Admin · Customers · ${brand.name}`,
};

interface PageProps {
  searchParams: { page?: string; search?: string };
}

export default function AdminCustomersPage({ searchParams }: PageProps) {
  const page = parseAdminCustomersPage(searchParams.page);
  const search = searchParams.search?.trim() ?? '';
  const suspenseKey = JSON.stringify({ page, search });

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Customers"
        description="Search and drill into order history and subscriptions."
      />
      <div className="mb-6">
        <CustomerSearchField defaultSearch={search} />
      </div>
      <Suspense
        key={suspenseKey}
        fallback={
          <AdminTableSkeleton
            caption="Admin customers list"
            columns={['Customer', 'Joined', 'Orders', 'LTV']}
          />
        }
      >
        <AdminCustomersSection page={page} search={search} />
      </Suspense>
    </>
  );
}
