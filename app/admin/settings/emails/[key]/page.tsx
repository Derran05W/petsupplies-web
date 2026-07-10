import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
            className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            <span aria-hidden>←</span>
            All templates
          </Link>
        }
      />
      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <EmailTemplateEditor templateKey={templateKey} />
      </section>
    </>
  );
}
