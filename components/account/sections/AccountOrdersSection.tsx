import { getOrders } from '@/lib/api/orders';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { OrdersList } from '@/components/account/orders/OrdersList';

interface AccountOrdersSectionProps {
  page: number;
  basePath: string;
  extraQuery?: Record<string, string | undefined>;
}

export async function AccountOrdersSection({
  page,
  basePath,
  extraQuery,
}: AccountOrdersSectionProps) {
  const accessToken = await getServerAccessToken();
  const data = await getOrders(
    accessToken ? { page, limit: 10, accessToken } : { page, limit: 10 },
  );

  return <OrdersList data={data} basePath={basePath} extraQuery={extraQuery} />;
}
