import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownContent } from '@/components/content/MarkdownContent';
import { fetchSitePage } from '@/lib/api/site/pages';
import { getBrand } from '@/lib/config/brand';
import { isStaticPageSlug, staticPageLabel } from '@/lib/site/static-pages';
import type { StaticPageSlug } from '@/types/site';

interface StaticPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  if (!isStaticPageSlug(params.slug)) {
    return { title: 'Not found' };
  }
  const slug = params.slug as StaticPageSlug;
  const [page, brand] = await Promise.all([fetchSitePage(slug), getBrand()]);
  if (!page) {
    return { title: `Not found · ${brand.name}` };
  }
  return {
    title: `${page.title} · ${brand.name}`,
    description: `${page.title} — ${brand.name}`,
  };
}

export default async function StaticContentPage({ params }: StaticPageProps) {
  if (!isStaticPageSlug(params.slug)) {
    notFound();
  }
  const slug = params.slug as StaticPageSlug;
  const page = await fetchSitePage(slug);
  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <header className="mb-8 border-b border-warm-200 pb-6">
        <h1 className="font-display text-4xl tracking-[-0.02em] text-warm-900 md:text-5xl">
          {page.title}
        </h1>
        <p className="text-warm-500 mt-2 font-body text-sm">
          {staticPageLabel(slug)}
        </p>
      </header>
      {page.bodyMarkdown.trim().length > 0 ? (
        <MarkdownContent markdown={page.bodyMarkdown} />
      ) : (
        <p className="font-body text-sm text-warm-600">Content coming soon.</p>
      )}
    </article>
  );
}
