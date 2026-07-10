import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { CategoryStripEditor } from '@/components/admin/settings/CategoryStripEditor';
import { FeaturedProductsEditor } from '@/components/admin/settings/FeaturedProductsEditor';
import { SiteSettingsHomepageForm } from '@/components/admin/settings/SiteSettingsHomepageForm';

export const metadata: Metadata = {
  title: `Admin · Homepage settings · ${brand.name}`,
};

export default function AdminHomepageSettingsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Homepage"
        description="Hero, category strip, brand values, and the curated product grid on the storefront."
      />

      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          Hero & brand values
        </h2>
        <p className="mt-1 max-w-2xl font-body text-sm leading-body text-ink-secondary">
          Headline copy, calls-to-action, hero image, and the trust strip below
          featured products.
        </p>
        <div className="mt-6">
          <SiteSettingsHomepageForm />
        </div>
      </section>

      <section className="mt-8 rounded-card border border-line bg-paper p-6 md:p-8">
        <CategoryStripEditor />
      </section>

      <section className="mt-8 rounded-card border border-line bg-paper p-6 md:p-8">
        <FeaturedProductsEditor />
      </section>
    </>
  );
}
