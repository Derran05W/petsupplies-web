import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import {
  adminGetCustomer,
  adminGetCustomerOrders,
  adminGetCustomerSubscriptions,
} from '@/lib/api/admin/customers';
import { ApiError } from '@/lib/api/client';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { CustomerDetailHeader } from '@/components/admin/customers/CustomerDetailHeader';
import { CustomerOrdersTable } from '@/components/admin/customers/CustomerOrdersTable';
import { CustomerSubscriptionsList } from '@/components/admin/customers/CustomerSubscriptionsList';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageProps {
  params: { id: string };
  searchParams: { page?: string; tab?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Admin · Customer · ${brand.name}`,
  };
}

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: PageProps) {
  const id = decodeURIComponent(params.id);
  const page = parsePage(searchParams.page);
  const tab = searchParams.tab === 'subscriptions' ? 'subscriptions' : 'orders';
  const accessToken = await getServerAccessToken();
  const opts = accessToken ? { accessToken } : {};

  try {
    const customer = await adminGetCustomer(id, opts);

    const orders =
      tab === 'orders'
        ? await adminGetCustomerOrders(id, { page, ...opts })
        : null;

    const subscriptions =
      tab === 'subscriptions'
        ? await adminGetCustomerSubscriptions(id, opts)
        : null;

    const tabClass = (active: boolean) =>
      cn(
        'rounded-lg px-4 py-2 font-body text-sm font-medium transition-colors',
        active
          ? 'bg-brand-400 text-white'
          : 'bg-warm-100 text-warm-700 hover:bg-warm-200',
      );

    const ordersLink = `/admin/customers/${encodeURIComponent(id)}`;
    const subsLink = `${ordersLink}?tab=subscriptions`;

    return (
      <>
        <AdminBanner />
        <CustomerDetailHeader customer={customer} />

        <nav
          aria-label="Customer sections"
          className="mt-6 flex flex-wrap gap-2 border-b border-warm-200 pb-4"
        >
          <Link href={ordersLink} className={tabClass(tab === 'orders')}>
            Orders
          </Link>
          <Link href={subsLink} className={tabClass(tab === 'subscriptions')}>
            Subscriptions
          </Link>
        </nav>

        <div className="mt-6">
          {tab === 'orders' && orders && (
            <>
              <CustomerOrdersTable orders={orders.orders} />
              {orders.totalPages > 1 && (
                <OrdersPagination
                  currentPage={orders.page}
                  totalPages={orders.totalPages}
                  basePath={ordersLink}
                />
              )}
            </>
          )}
          {tab === 'subscriptions' && subscriptions && (
            <CustomerSubscriptionsList subscriptions={subscriptions} />
          )}
        </div>
      </>
    );
  } catch (err) {
    const message =
      err instanceof ApiError && err.status === 404
        ? 'Customer not found.'
        : err instanceof ApiError
          ? err.message
          : 'Failed to load customer.';
    return (
      <>
        <AdminBanner />
        <PageHeader heading="Customer" description="" />
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
        <Link
          href="/admin/customers"
          className="mt-4 inline-block text-sm font-medium text-brand-600"
        >
          ← Back to customers
        </Link>
      </>
    );
  }
}
