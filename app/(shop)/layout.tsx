import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FreeShippingThresholdProvider } from '@/components/providers/FreeShippingThresholdProvider';
import { RewardTiersProvider } from '@/components/providers/RewardTiersProvider';
import { StorefrontBrandProvider } from '@/components/providers/StorefrontBrandProvider';
import { StorefrontNavProvider } from '@/components/providers/StorefrontNavProvider';
import { getBrand } from '@/lib/config/brand';
import { getFreeShippingThresholdCents } from '@/lib/config/shipping';
import { getRewardTiers } from '@/lib/config/rewards';
import { fetchSiteNav } from '@/lib/api/site/nav';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [thresholdCents, rewardTiers, storefrontBrand, siteNav] =
    await Promise.all([
      getFreeShippingThresholdCents(),
      getRewardTiers(),
      getBrand(),
      fetchSiteNav(),
    ]);

  return (
    <StorefrontBrandProvider brand={storefrontBrand}>
      <StorefrontNavProvider headerLinks={siteNav.header}>
        <FreeShippingThresholdProvider thresholdCents={thresholdCents}>
          <RewardTiersProvider tiers={rewardTiers}>
            <div className="flex min-h-svh flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer brand={storefrontBrand} />
            </div>
          </RewardTiersProvider>
        </FreeShippingThresholdProvider>
      </StorefrontNavProvider>
    </StorefrontBrandProvider>
  );
}
