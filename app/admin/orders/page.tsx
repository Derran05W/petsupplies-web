import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { adminListOrders } from '@/lib/api/admin/orders';
import type { OrderStatus } from '@/types/order';
import { PageHeader } from '@/components/account/PageHeader';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminOrderTable } from '@/components/admin/orders/AdminOrderTable';
import { AdminOrdersToolbar } from '@/components/admin/orders/AdminOrdersToolbar';
import { OrderDetailDrawer } from '@/components/admin/orders/OrderDetailDrawer';
import { OrdersEmpty } from '@/components/account/orders/OrdersEmpty';

export const metadata: Metadata = {
  title: `Admin · Orders · ${brand.name}`,
};

interface AdminOrdersPageProps {
  searchParams: {
    page?: string;
    status?: string;
    selected?: string;
  };
}

const ORDER_STATUS_VALUES: OrderStatus[] = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseStatus(raw: string | undefined): OrderStatus | undefined {
  if (!raw) return undefined;
  return ORDER_STATUS_VALUES.includes(raw as OrderStatus)
    ? (raw as OrderStatus)
    : undefined;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const page = parsePage(searchParams.page);
  const status = parseStatus(searchParams.status);
  const selectedId = searchParams.selected ?? null;

  const accessToken = await getServerAccessToken();
  const data = await adminListOrders({
    page,
    ...(status ? { status } : {}),
    ...(accessToken ? { accessToken } : {}),
  });

  const buildViewHref = (id: string): string => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (page > 1) params.set('page', String(page));
    params.set('selected', id);
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Orders"
        description="Update fulfilment status and add tracking details for shipped orders."
      />

      <AdminOrdersToolbar />

      {data.orders.length === 0 ? (
        <OrdersEmpty />
      ) : (
        <>
          <AdminOrderTable orders={data.orders} buildViewHref={buildViewHref} />
          <OrdersPagination
            currentPage={data.page}
            totalPages={data.totalPages}
            basePath="/admin/orders"
            extraQuery={{ status: status ?? undefined }}
          />
        </>
      )}

      <OrderDetailDrawer selectedId={selectedId} orders={data.orders} />
    </>
  );
}
