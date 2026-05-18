import type { Metadata } from 'next';
import { Suspense } from 'react';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { SubscriptionList } from '@/components/account/subscriptions/SubscriptionList';
import { SubscriptionSkeleton } from '@/components/account/subscriptions/SubscriptionSkeleton';

export const metadata: Metadata = {
  title: `Subscribe & Save · ${brand.name}`,
};

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        heading="Subscribe & Save"
        description="Pause, resume, or update your recurring deliveries at any time."
      />
      <Suspense fallback={<SubscriptionSkeleton />}>
        <SubscriptionList />
      </Suspense>
    </>
  );
}
