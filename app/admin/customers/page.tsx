import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { adminListCustomers } from '@/lib/api/admin/customers';
import { ApiError } from '@/lib/api/client';
import { PageHeader } from '@/components/account/PageHeader';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { CustomerTable } from '@/components/admin/customers/CustomerTable';
import { CustomerSearchField } from '@/components/admin/customers/CustomerSearchField';

export const metadata: Metadata = {
  title: `Admin · Customers · ${brand.name}`,
};

interface PageProps {
  searchParams: { page?: string; search?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const page = parsePage(searchParams.page);
  const search = searchParams.search?.trim() ?? '';
  const accessToken = await getServerAccessToken();

  try {
    const data = await adminListCustomers({
      page,
      search: search.length > 0 ? search : undefined,
      ...(accessToken ? { accessToken } : {}),
    });

    const filtered = search.length > 0 || page > 1;

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

        {data.customers.length === 0 ? (
          <p className="rounded-2xl border border-warm-200 bg-white px-5 py-8 text-center font-body text-sm text-warm-600">
            {filtered ? 'No customers match this search.' : 'No customers yet.'}
          </p>
        ) : (
          <>
            <CustomerTable customers={data.customers} />
            <OrdersPagination
              currentPage={data.page}
              totalPages={data.totalPages}
              basePath="/admin/customers"
              extraQuery={search.length > 0 ? { search } : undefined}
            />
          </>
        )}
      </>
    );
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : 'Failed to load customers.';
    return (
      <>
        <AdminBanner />
        <PageHeader heading="Customers" description="" />
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      </>
    );
  }
}
