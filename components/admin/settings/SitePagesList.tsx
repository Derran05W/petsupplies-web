'use client';

import Link from 'next/link';
import { useAdminSitePagesQuery } from '@/hooks/useAdminSitePages';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import { staticPageLabel } from '@/lib/site/static-pages';
import type { StaticPageSlug } from '@/types/site';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export function SitePagesList() {
  const { data, isPending, error } = useAdminSitePagesQuery();

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading pages…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-body text-sm text-red-700" role="alert">
        {adminApiErrorMessage(error)}
      </p>
    );
  }

  const pages = data?.pages ?? [];

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Static site pages</caption>
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              <th scope="col" className="px-4 py-3">
                Page
              </th>
              <th scope="col" className="px-4 py-3">
                Title
              </th>
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                Updated
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr
                key={page.slug}
                className="text-warm-800 border-b border-warm-100 font-body text-sm last:border-0"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-warm-900">
                    {staticPageLabel(page.slug as StaticPageSlug)}
                  </span>
                  <span className="text-warm-500 mt-0.5 block font-mono text-xs">
                    /{page.slug}
                  </span>
                </td>
                <td className="px-4 py-3">{page.title}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  {formatDate(page.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                      page.isPublished
                        ? 'bg-brand-50 text-brand-700'
                        : 'bg-warm-100 text-warm-600',
                    )}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/settings/pages/${page.slug}`}
                    className="font-body text-sm text-brand-600 hover:text-brand-700"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
