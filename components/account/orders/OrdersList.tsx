import type { OrderListResponse } from '@/types/account';
import { OrderRow } from './OrderRow';
import { OrdersEmpty } from './OrdersEmpty';
import { OrdersPagination } from './OrdersPagination';

interface OrdersListProps {
  data: OrderListResponse;
  /** Base path used by pagination links. Defaults to `/account` so the
   * orders list at the index route paginates back to itself. */
  basePath?: string;
}

/**
 * Server-rendered orders list. Accepts an already-fetched
 * `OrderListResponse` so the parent server component can choose whether
 * to fetch eagerly or wrap in `<Suspense>` later. Renders the empty
 * state when the list is empty, otherwise the list + pagination.
 */
export function OrdersList({ data, basePath = '/account' }: OrdersListProps) {
  if (data.orders.length === 0) {
    return <OrdersEmpty />;
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {data.orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </ul>
      <OrdersPagination
        currentPage={data.page}
        totalPages={data.totalPages}
        basePath={basePath}
      />
    </>
  );
}
