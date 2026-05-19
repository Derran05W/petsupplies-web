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

interface AccountPageProps {
  searchParams: { page?: string; returnTo?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/**
 * `/account` — order history list (Phase 7 home for the customer hub).
 * Server component: fetches the access token from the request-scoped
 * Supabase client and forwards it to `getOrders`. URL-driven `?page=`
 * pagination — no client-side state.
 *
 * The middleware already enforces auth on `/account/*`, so we don't
 * branch on `user === null` here; if the access-token read returns
 * `undefined`, `getOrders` will surface a backend 401 (or fall through
 * to the dev placeholder when the backend is unreachable).
 */
export default async function AccountPage({ searchParams }: AccountPageProps) {
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
      <OrdersList data={data} basePath="/account" extraQuery={extraQuery} />
    </>
  );
}
