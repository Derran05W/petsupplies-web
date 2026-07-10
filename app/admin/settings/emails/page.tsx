import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { EmailTemplatesList } from '@/components/admin/settings/EmailTemplatesList';

export const metadata: Metadata = {
  title: `Admin · Email templates · ${brand.name}`,
};

export default function AdminEmailTemplatesSettingsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Email templates"
        description="Edit subjects and body copy for transactional emails sent by the API."
      />
      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <EmailTemplatesList />
      </section>
    </>
  );
}
