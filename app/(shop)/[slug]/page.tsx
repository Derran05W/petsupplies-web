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
    <article className="mx-auto max-w-3xl px-gutter py-12 text-ink md:py-16">
      <header className="mb-10 border-b border-line pb-8">
        <p className="font-body text-kicker uppercase text-pine">
          {staticPageLabel(slug)}
        </p>
        <h1 className="mt-4 font-display text-display text-ink">
          {page.title}
        </h1>
      </header>
      {page.bodyMarkdown.trim().length > 0 ? (
        <MarkdownContent markdown={page.bodyMarkdown} />
      ) : (
        <p className="font-body text-sm leading-body text-ink-secondary">
          Content coming soon.
        </p>
      )}
    </article>
  );
}
