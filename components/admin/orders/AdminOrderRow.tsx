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
    <tr className="border-b border-line transition-colors duration-fast last:border-b-0 hover:bg-panel">
      <td className="px-4 py-3 align-top">
        <p className="font-body text-sm font-medium text-ink">
          {shortId(order.id)}
        </p>
        <p className="font-body text-xs text-ink-muted">
          {formatDate(order.createdAt)}
        </p>
      </td>
      <td className="hidden px-4 py-3 align-top md:table-cell">
        <p className="font-body text-sm text-ink">
          {order.customerName ?? order.shippingAddress.fullName}
        </p>
        <p className="break-all font-body text-xs text-ink-muted">
          {order.customerEmail}
        </p>
      </td>
      <td className="px-4 py-3 align-top">
        <OrderStatusPill status={order.status} />
      </td>
      <td className="px-4 py-3 align-top font-display text-sm text-ink">
        {formatPrice(order.totalCents, order.currency)}
      </td>
      <td className="px-4 py-3 text-right align-top">
        <Link
          href={viewHref}
          scroll={false}
          className="inline-flex items-center rounded-pill border border-line bg-transparent px-3 py-1 font-body text-micro uppercase text-ink transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
