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
      <p className="rounded-card border border-line bg-paper px-5 py-8 text-center font-body text-sm text-ink-secondary">
        No orders for this customer yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] font-body text-sm">
          <thead>
            <tr className="border-b border-line text-left font-body text-micro uppercase text-ink-muted">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
              <th className="px-5 py-3 text-right font-medium">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr
                key={o.id}
                className="transition-colors duration-fast hover:bg-panel"
              >
                <td className="px-5 py-3 text-ink-secondary">
                  {formatDate(o.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusPill status={o.status} />
                </td>
                <td className="px-5 py-3 text-right font-display tabular-nums text-ink">
                  {formatPrice(o.totalCents, o.currency)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/orders?selected=${encodeURIComponent(o.id)}`}
                    className="font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100"
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
