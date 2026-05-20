import { adminListOrders } from '@/lib/api/admin/orders';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import type { OrderStatus } from '@/types/order';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { OrdersEmpty } from '@/components/account/orders/OrdersEmpty';
import { AdminOrderTable } from '@/components/admin/orders/AdminOrderTable';
import { OrderDetailDrawer } from '@/components/admin/orders/OrderDetailDrawer';
import { AdminSectionError } from './AdminSectionError';

const ORDER_STATUS_VALUES: OrderStatus[] = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export function parseAdminOrdersPage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseAdminOrdersStatus(
  raw: string | undefined,
): OrderStatus | undefined {
  if (!raw) return undefined;
  return ORDER_STATUS_VALUES.includes(raw as OrderStatus)
    ? (raw as OrderStatus)
    : undefined;
}

interface AdminOrdersSectionProps {
  page: number;
  status?: OrderStatus;
  selectedId: string | null;
}

export async function AdminOrdersSection({
  page,
  status,
  selectedId,
}: AdminOrdersSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const data = await adminListOrders({
      page,
      ...(status ? { status } : {}),
      ...opts,
    });

    const buildViewHref = (id: string): string => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (page > 1) params.set('page', String(page));
      params.set('selected', id);
      return `/admin/orders?${params.toString()}`;
    };

    if (data.orders.length === 0) {
      return (
        <>
          <OrdersEmpty />
          <OrderDetailDrawer selectedId={selectedId} orders={[]} />
        </>
      );
    }

    return (
      <>
        <AdminOrderTable orders={data.orders} buildViewHref={buildViewHref} />
        <OrdersPagination
          currentPage={data.page}
          totalPages={data.totalPages}
          basePath="/admin/orders"
          extraQuery={{ status: status ?? undefined }}
        />
        <OrderDetailDrawer selectedId={selectedId} orders={data.orders} />
      </>
    );
  } catch (err) {
    return <AdminSectionError err={err} fallback="Failed to load orders." />;
  }
}
