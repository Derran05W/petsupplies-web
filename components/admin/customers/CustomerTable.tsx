import Link from 'next/link';
import type { AdminCustomerListRow } from '@/types/admin-customers';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerTableProps {
  customers: AdminCustomerListRow[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-card border border-line bg-paper">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] font-body text-sm">
          <thead>
            <tr className="border-b border-line text-left font-body text-micro uppercase text-ink-muted">
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Orders</th>
              <th className="px-5 py-3 text-right font-medium">LTV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr
                key={c.id}
                className="transition-colors duration-fast hover:bg-panel"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(c.id)}`}
                    className="block transition-colors duration-fast hover:text-pine"
                  >
                    <span className="font-medium text-ink">
                      {c.name?.trim() || '—'}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                      {c.email}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-secondary">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-ink-secondary">
                  {c.ordersCount}
                </td>
                <td className="px-5 py-3 text-right font-display tabular-nums text-ink">
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
