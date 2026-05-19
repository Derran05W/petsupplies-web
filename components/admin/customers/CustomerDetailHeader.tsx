import Link from 'next/link';
import type { AdminCustomerDetail } from '@/types/admin-customers';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerDetailHeaderProps {
  customer: AdminCustomerDetail;
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  return (
    <header className="rounded-2xl border border-warm-200 bg-surface-card p-5 md:p-6">
      <p className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
        Customer
      </p>
      <h1 className="mt-1 font-display text-2xl tracking-tight text-warm-900 md:text-3xl">
        {customer.name?.trim() || customer.email}
      </h1>
      <p className="mt-2 font-body text-sm text-warm-600">{customer.email}</p>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Joined
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-warm-900">
            {formatDate(customer.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Orders
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-warm-900">
            {customer.ordersCount}
          </dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
            Lifetime value
          </dt>
          <dd className="mt-1 font-body text-sm font-medium text-warm-900">
            {formatPrice(customer.lifetimeValueCents, customer.currency)}
          </dd>
        </div>
        {customer.subscriptionsCount !== undefined && (
          <div>
            <dt className="font-body text-xs uppercase tracking-[0.08em] text-warm-600">
              Subscriptions
            </dt>
            <dd className="mt-1 font-body text-sm font-medium text-warm-900">
              {customer.subscriptionsCount}
            </dd>
          </div>
        )}
      </dl>
      {customer.defaultAddress && (
        <p className="text-warm-700 mt-4 font-body text-sm">
          <span className="font-medium text-warm-900">Address: </span>
          {customer.defaultAddress}
        </p>
      )}
      {customer.lastOrderAt && (
        <p className="mt-2 font-body text-sm text-warm-600">
          Last order {formatDate(customer.lastOrderAt)}
        </p>
      )}
      <div className="mt-4">
        <Link
          href="/admin/customers"
          className="font-body text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to customers
        </Link>
      </div>
    </header>
  );
}
