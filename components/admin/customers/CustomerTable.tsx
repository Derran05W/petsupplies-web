import Link from 'next/link';
import type { AdminCustomerListRow } from '@/types/admin-customers';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerTableProps {
  customers: AdminCustomerListRow[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-body text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50 text-left text-xs uppercase tracking-[0.06em] text-warm-600">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Orders</th>
              <th className="px-5 py-3 text-right font-medium">LTV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-warm-50/80">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(c.id)}`}
                    className="block hover:text-brand-600"
                  >
                    <span className="font-medium text-warm-900">
                      {c.name?.trim() || '—'}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-warm-600">
                      {c.email}
                    </span>
                  </Link>
                </td>
                <td className="text-warm-700 px-5 py-3">
                  {formatDate(c.createdAt)}
                </td>
                <td className="text-warm-700 px-5 py-3 text-right tabular-nums">
                  {c.ordersCount}
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-warm-900">
                  {formatPrice(c.lifetimeValueCents, c.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
