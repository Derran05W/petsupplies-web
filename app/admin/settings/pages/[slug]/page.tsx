import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { SitePageEditor } from '@/components/admin/settings/SitePageEditor';
import { isStaticPageSlug, staticPageLabel } from '@/lib/site/static-pages';
import type { StaticPageSlug } from '@/types/site';

interface AdminSitePageEditProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: AdminSitePageEditProps): Promise<Metadata> {
  if (!isStaticPageSlug(params.slug)) {
    return { title: `Admin · Pages · ${brand.name}` };
  }
  return {
    title: `Admin · ${staticPageLabel(params.slug as StaticPageSlug)} · ${brand.name}`,
  };
}

export default function AdminSitePageEditPage({
  params,
}: AdminSitePageEditProps) {
  if (!isStaticPageSlug(params.slug)) {
    notFound();
  }
  const slug = params.slug as StaticPageSlug;

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading={staticPageLabel(slug)}
        description="Edit markdown content and publish when ready."
        breadcrumb={[
          { label: 'Settings', href: '/admin/settings' },
          { label: 'Pages', href: '/admin/settings/pages' },
          { label: staticPageLabel(slug) },
        ]}
        action={
          <Link
            href="/admin/settings/pages"
            className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            <span aria-hidden>←</span>
            All pages
          </Link>
        }
      />
      <section className="rounded-card border border-line bg-paper p-6 md:p-8">
        <SitePageEditor slug={slug} />
      </section>
    </>
  );
}
