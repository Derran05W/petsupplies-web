import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { SitePagesList } from '@/components/admin/settings/SitePagesList';

export const metadata: Metadata = {
  title: `Admin · Pages · ${brand.name}`,
};

export default function AdminSitePagesSettingsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Pages"
        description="About, legal, and help content rendered as markdown on the storefront."
      />
      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <SitePagesList />
      </section>
    </>
  );
}
