import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { getOrderById } from '@/lib/api/orders';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { PageHeader } from '@/components/account/PageHeader';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { OrderTracking } from '@/components/account/orders/OrderTracking';

interface OrderDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  return {
    title: `Order #${params.id.slice(-8)} · ${brand.name}`,
  };
}

/**
 * `/account/orders/[id]` — order detail page. Reuses the Phase 6
 * `<OrderSummaryCard />` verbatim (same status / line items / shipping
 * address / receipt-email block) and adds the carrier-agnostic tracking
 * strip below.
 *
 * Authorisation is owned by the backend — if the customer requests
 * another user's order ID, the API returns 404 and we render the
 * "not found" state. We deliberately do NOT scan all orders here just
 * to confirm ownership; that would double the load on the orders
 * endpoint per detail-page render.
 */
export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const accessToken = await getServerAccessToken();
  const order = await getOrderById(
    params.id,
    accessToken ? { accessToken } : {},
  );

  if (!order) notFound();

  const shortId = `#${order.id.slice(-8)}`;

  return (
    <>
      <PageHeader
        heading={`Order ${shortId}`}
        breadcrumb={[
          { label: 'Account', href: '/account' },
          { label: 'Orders', href: '/account' },
          { label: shortId },
        ]}
      />

      <div className="flex flex-col items-stretch">
        <OrderSummaryCard order={order} />
        <OrderTracking order={order} />

        <div className="mt-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-lg border border-warm-300 bg-transparent px-4 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
          >
            <ArrowLeft size={14} aria-hidden /> Back to orders
          </Link>
        </div>
      </div>
    </>
  );
}
