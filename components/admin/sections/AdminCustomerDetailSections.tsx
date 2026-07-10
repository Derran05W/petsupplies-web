import Link from 'next/link';
import {
  adminGetCustomer,
  adminGetCustomerOrders,
  adminGetCustomerSubscriptions,
} from '@/lib/api/admin/customers';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import { ApiError } from '@/lib/api/client';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { CustomerDetailHeader } from '@/components/admin/customers/CustomerDetailHeader';
import { CustomerOrdersTable } from '@/components/admin/customers/CustomerOrdersTable';
import { CustomerSubscriptionsList } from '@/components/admin/customers/CustomerSubscriptionsList';
import { AdminSectionError } from './AdminSectionError';

export function parseAdminCustomerPage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

interface AdminCustomerHeaderSectionProps {
  customerId: string;
}

export async function AdminCustomerHeaderSection({
  customerId,
}: AdminCustomerHeaderSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const customer = await adminGetCustomer(customerId, opts);
    return <CustomerDetailHeader customer={customer} />;
  } catch (err) {
    return <AdminCustomerDetailError err={err} />;
  }
}

interface AdminCustomerTabSectionProps {
  customerId: string;
  tab: 'orders' | 'subscriptions';
  page: number;
}

export async function AdminCustomerTabSection({
  customerId,
  tab,
  page,
}: AdminCustomerTabSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const ordersLink = `/admin/customers/${encodeURIComponent(customerId)}`;

    if (tab === 'orders') {
      const orders = await adminGetCustomerOrders(customerId, {
        page,
        ...opts,
      });
      return (
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
      );
    }

    const subscriptions = await adminGetCustomerSubscriptions(customerId, opts);
    return <CustomerSubscriptionsList subscriptions={subscriptions} />;
  } catch (err) {
    return (
      <AdminSectionError err={err} fallback="Failed to load this section." />
    );
  }
}

function AdminCustomerDetailError({ err }: { err: unknown }) {
  const message =
    err instanceof ApiError && err.status === 404
      ? 'Customer not found.'
      : err instanceof ApiError
        ? err.message
        : 'Failed to load customer.';
  return (
    <div className="rounded-card border border-danger-border bg-danger-surface px-5 py-4">
      <p role="alert" className="font-body text-sm text-danger-solid">
        {message}
      </p>
      <Link
        href="/admin/customers"
        className="mt-3 inline-block font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100"
      >
        ← Back to customers
      </Link>
    </div>
  );
}
