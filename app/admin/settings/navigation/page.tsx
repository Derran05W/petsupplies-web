import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { NavigationSettingsTabs } from '@/components/admin/settings/NavigationSettingsTabs';

export const metadata: Metadata = {
  title: `Admin · Navigation · ${brand.name}`,
};

export default function AdminNavigationSettingsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Navigation"
        description="Header links and footer columns shown across the storefront."
      />

      <section className="rounded-xl border border-warm-200 bg-surface-card p-6 md:p-8">
        <NavigationSettingsTabs />
      </section>
    </>
  );
}
