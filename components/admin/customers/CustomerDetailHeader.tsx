import Link from 'next/link';
import type { AdminCustomerDetail } from '@/types/admin-customers';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerDetailHeaderProps {
  customer: AdminCustomerDetail;
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  return (
    <header className="rounded-card border border-line bg-paper p-5 md:p-6">
      <p className="font-body text-kicker uppercase text-pine">Customer</p>
      <h1 className="mt-1 font-display text-2xl tracking-[-0.01em] text-ink md:text-3xl">
        {customer.name?.trim() || customer.email}
      </h1>
      <p className="mt-2 font-body text-sm text-ink-muted">{customer.email}</p>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="font-body text-micro uppercase text-ink-faint">
            Joined
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-ink">
            {formatDate(customer.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="font-body text-micro uppercase text-ink-faint">
            Orders
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-ink">
            {customer.ordersCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-micro uppercase text-ink-faint">
            Lifetime value
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-ink">
            {formatPrice(customer.lifetimeValueCents, customer.currency)}
          </dd>
        </div>
        {customer.subscriptionsCount !== undefined && (
          <div>
            <dt className="font-body text-micro uppercase text-ink-faint">
              Subscriptions
            </dt>
            <dd className="mt-1 font-body text-sm font-medium text-ink">
              {customer.subscriptionsCount}
            </dd>
          </div>
        )}
      </dl>
      {customer.defaultAddress && (
        <p className="mt-4 font-body text-sm text-ink-secondary">
          <span className="font-medium text-ink">Address: </span>
          {customer.defaultAddress}
        </p>
      )}
      {customer.lastOrderAt && (
        <p className="mt-2 font-body text-sm text-ink-muted">
          Last order {formatDate(customer.lastOrderAt)}
        </p>
      )}
      <div className="mt-4">
        <Link
          href="/admin/customers"
          className="font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100"
        >
          ← Back to customers
        </Link>
      </div>
    </header>
  );
}
