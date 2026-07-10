import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { SiteSettingsBrandForm } from '@/components/admin/settings/SiteSettingsBrandForm';
import { SiteSettingsShippingForm } from '@/components/admin/settings/SiteSettingsShippingForm';

export const metadata: Metadata = {
  title: `Admin · Settings · ${brand.name}`,
};

export default function AdminSettingsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Settings"
        description="Storefront shipping, brand, and homepage content — no deploy required."
      />

      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          Brand
        </h2>
        <p className="mt-1 max-w-2xl font-body text-sm leading-body text-ink-secondary">
          Store name, tagline, support contact, and social links shown across
          the storefront and transactional emails.
        </p>
        <div className="mt-6">
          <SiteSettingsBrandForm />
        </div>
      </section>

      <section className="mt-8 rounded-card border border-line bg-paper p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          Shipping
        </h2>
        <p className="mt-1 max-w-2xl font-body text-sm leading-body text-ink-secondary">
          Control the free-shipping threshold shown on the homepage, product
          pages, and cart progress bar.
        </p>
        <div className="mt-6">
          <SiteSettingsShippingForm />
        </div>
      </section>
    </>
  );
}
