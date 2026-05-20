import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminAnalyticsDashboard } from '@/components/admin/analytics/AdminAnalyticsDashboard';

export const metadata: Metadata = {
  title: `Admin · ${brand.name}`,
};

/**
 * `/admin` — analytics hub (Phase 21). Banner + heading paint
 * immediately; KPIs and panels stream in via Suspense.
 */
export default function AdminDashboardPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Dashboard"
        description="Store analytics, top products, low stock, subscriptions, and discounts."
      />
      <AdminAnalyticsDashboard />
    </>
  );
}
