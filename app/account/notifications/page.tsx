import type { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { brand } from '@/lib/config/brand';
import { listStockAlerts } from '@/lib/api/stockAlerts';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { PageHeader } from '@/components/account/PageHeader';
import { StockAlertList } from '@/components/account/notifications/StockAlertList';
import { STOCK_ALERTS_QUERY_KEY } from '@/lib/stock-alerts/query-key';

export const metadata: Metadata = {
  title: `Stock alerts · ${brand.name}`,
};

export default async function NotificationsPage() {
  const accessToken = await getServerAccessToken();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: STOCK_ALERTS_QUERY_KEY,
    queryFn: () => listStockAlerts(accessToken ? { accessToken } : {}),
  });

  return (
    <>
      <PageHeader
        heading="Stock alerts"
        description="We'll email you when these products are back in stock."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StockAlertList />
      </HydrationBoundary>
    </>
  );
}
