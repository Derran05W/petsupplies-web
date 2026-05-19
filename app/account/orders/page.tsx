import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getOrders } from '@/lib/api/orders';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { safeReturnPath } from '@/lib/navigation/safe-return-path';
import { PageHeader } from '@/components/account/PageHeader';
import { OrdersList } from '@/components/account/orders/OrdersList';

export const metadata: Metadata = {
  title: `Your orders · ${brand.name}`,
};

interface OrdersPageProps {
  searchParams: { page?: string; returnTo?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/**
 * `/account/orders` — alias for `/account` so deep links from emails
 * (e.g. order confirmation, abandoned cart) and from
 * `<SuccessContents />`'s "View your orders" CTA both land somewhere
 * sensible. We render the same content rather than 301'ing because both
 * URLs are reasonable bookmarks for the customer.
 */
export default async function OrdersAliasPage({
  searchParams,
}: OrdersPageProps) {
  const page = parsePage(searchParams.page);
  const accessToken = await getServerAccessToken();
  const data = await getOrders(accessToken ? { page, accessToken } : { page });

  const safeReturn = safeReturnPath(searchParams.returnTo);
  const extraQuery = safeReturn ? { returnTo: safeReturn } : undefined;

  return (
    <>
      <PageHeader
        heading="Your orders"
        description="Everything you've ordered, with status and tracking when available."
      />
      <OrdersList
        data={data}
        basePath="/account/orders"
        extraQuery={extraQuery}
      />
    </>
  );
}
