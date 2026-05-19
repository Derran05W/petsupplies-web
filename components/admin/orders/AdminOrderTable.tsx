import type { AdminOrderSummary } from '@/types/admin';
import { AdminOrderRow } from './AdminOrderRow';

interface AdminOrderTableProps {
  orders: AdminOrderSummary[];
  /** Builder for the "View" link's href. Lets the page preserve any
   * URL filters (status / page) when adding `selected=<orderId>`. */
  buildViewHref: (orderId: string) => string;
}

export function AdminOrderTable({
  orders,
  buildViewHref,
}: AdminOrderTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Admin orders list</caption>
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              <th scope="col" className="px-4 py-3">
                Order
              </th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell">
                Customer
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <AdminOrderRow
                key={order.id}
                order={order}
                viewHref={buildViewHref(order.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
