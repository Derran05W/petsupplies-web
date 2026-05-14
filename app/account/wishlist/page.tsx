import type { Metadata } from 'next';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { brand } from '@/lib/config/brand';
import { listWishlist } from '@/lib/api/wishlist';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { PageHeader } from '@/components/account/PageHeader';
import { WishlistGrid } from '@/components/wishlist/WishlistGrid';
import { WISHLIST_QUERY_KEY } from '@/lib/wishlist/query-key';

export const metadata: Metadata = {
  title: `Wishlist · ${brand.name}`,
};

export default async function WishlistPage() {
  const accessToken = await getServerAccessToken();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => listWishlist(accessToken ? { accessToken } : {}),
  });

  return (
    <>
      <PageHeader
        heading="Wishlist"
        description="Products you've saved for later."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WishlistGrid />
      </HydrationBoundary>
    </>
  );
}
