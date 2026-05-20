import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { EmailTemplateEditor } from '@/components/admin/settings/EmailTemplateEditor';
import {
  emailTemplateLabel,
  isEmailTemplateKey,
  type EmailTemplateKey,
} from '@/lib/site/email-template-vars';

interface AdminEmailTemplateEditProps {
  params: { key: string };
}

export async function generateMetadata({
  params,
}: AdminEmailTemplateEditProps): Promise<Metadata> {
  if (!isEmailTemplateKey(params.key)) {
    return { title: `Admin · Email templates · ${brand.name}` };
  }
  return {
    title: `Admin · ${emailTemplateLabel(params.key as EmailTemplateKey)} · ${brand.name}`,
  };
}

export default function AdminEmailTemplateEditPage({
  params,
}: AdminEmailTemplateEditProps) {
  if (!isEmailTemplateKey(params.key)) {
    notFound();
  }
  const templateKey = params.key as EmailTemplateKey;

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading={emailTemplateLabel(templateKey)}
        description="Subject, preheader, and markdown body with allow-listed variables."
        breadcrumb={[
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Emails', href: '/admin/settings/emails' },
          { label: emailTemplateLabel(templateKey) },
        ]}
        action={
          <Link
            href="/admin/settings/emails"
            className="inline-flex items-center gap-1 font-body text-sm text-warm-600 transition-colors hover:text-warm-900"
          >
            <ChevronLeft size={16} aria-hidden />
            All templates
          </Link>
        }
      />
      <section className="rounded-xl border border-warm-200 bg-surface-card p-6 md:p-8">
        <EmailTemplateEditor templateKey={templateKey} />
      </section>
    </>
  );
}
