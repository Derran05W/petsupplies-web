import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminAnalyticsDashboard } from '@/components/admin/analytics/AdminAnalyticsDashboard';

export const metadata: Metadata = {
  title: `Admin · Analytics · ${brand.name}`,
};

export default async function AdminAnalyticsPage() {
  const accessToken = await getServerAccessToken();

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Analytics"
        description="Deep-dive metrics — same data as the dashboard hub."
      />
      <AdminAnalyticsDashboard accessToken={accessToken} />
    </>
  );
}
