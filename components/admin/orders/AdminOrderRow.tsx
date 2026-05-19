import Link from 'next/link';
import type { AdminOrderSummary } from '@/types/admin';
import { OrderStatusPill } from '@/components/account/orders/OrderStatusPill';
import { formatDate, formatPrice } from '@/lib/utils/format';

interface AdminOrderRowProps {
  order: AdminOrderSummary;
  /** URL to navigate to when "View" is clicked. The page reads this
   * via `?selected=<id>` to open the drawer. */
  viewHref: string;
}

function shortId(id: string): string {
  return `#${id.slice(-8)}`;
}

export function AdminOrderRow({ order, viewHref }: AdminOrderRowProps) {
  return (
    <tr className="border-b border-warm-200 last:border-b-0 hover:bg-warm-50">
      <td className="px-4 py-3 align-top">
        <p className="font-body text-sm font-medium text-warm-900">
          {shortId(order.id)}
        </p>
        <p className="font-body text-xs text-warm-600">
          {formatDate(order.createdAt)}
        </p>
      </td>
      <td className="hidden px-4 py-3 align-top md:table-cell">
        <p className="font-body text-sm text-warm-900">
          {order.customerName ?? order.shippingAddress.fullName}
        </p>
        <p className="break-all font-body text-xs text-warm-600">
          {order.customerEmail}
        </p>
      </td>
      <td className="px-4 py-3 align-top">
        <OrderStatusPill status={order.status} />
      </td>
      <td className="px-4 py-3 align-top font-body text-sm font-medium text-warm-900">
        {formatPrice(order.totalCents, order.currency)}
      </td>
      <td className="px-4 py-3 text-right align-top">
        <Link
          href={viewHref}
          scroll={false}
          className="inline-flex items-center rounded-md border border-warm-300 bg-surface-card px-2.5 py-1 font-body text-xs text-warm-900 transition-colors hover:bg-warm-100"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
