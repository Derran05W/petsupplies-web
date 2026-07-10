import { adminListCustomers } from '@/lib/api/admin/customers';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { CustomerTable } from '@/components/admin/customers/CustomerTable';
import { AdminSectionError } from './AdminSectionError';

export function parseAdminCustomersPage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

interface AdminCustomersSectionProps {
  page: number;
  search: string;
}

export async function AdminCustomersSection({
  page,
  search,
}: AdminCustomersSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const data = await adminListCustomers({
      page,
      search: search.length > 0 ? search : undefined,
      ...opts,
    });

    const filtered = search.length > 0 || page > 1;

    if (data.customers.length === 0) {
      return (
        <p className="rounded-card border border-line bg-paper px-5 py-8 text-center font-body text-sm text-ink-secondary">
          {filtered ? 'No customers match this search.' : 'No customers yet.'}
        </p>
      );
    }

    return (
      <>
        <CustomerTable customers={data.customers} />
        <OrdersPagination
          currentPage={data.page}
          totalPages={data.totalPages}
          basePath="/admin/customers"
          extraQuery={search.length > 0 ? { search } : undefined}
        />
      </>
    );
  } catch (err) {
    return <AdminSectionError err={err} fallback="Failed to load customers." />;
  }
}
