import Link from 'next/link';
import type { OrderSummary } from '@/types/order';
import { OrderStatusPill } from '@/components/account/orders/OrderStatusPill';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface CustomerOrdersTableProps {
  orders: OrderSummary[];
}

export function CustomerOrdersTable({ orders }: CustomerOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-warm-200 bg-surface-card px-5 py-8 text-center font-body text-sm text-warm-600">
        No orders for this customer yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] font-body text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50 text-left text-xs uppercase tracking-[0.06em] text-warm-600">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
              <th className="px-5 py-3 text-right font-medium">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-warm-50/80">
                <td className="text-warm-800 px-5 py-3">
                  {formatDate(o.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusPill status={o.status} />
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-warm-900">
                  {formatPrice(o.totalCents, o.currency)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/orders?selected=${encodeURIComponent(o.id)}`}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
