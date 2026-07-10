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
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading pages…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(error)}
      </p>
    );
  }

  const pages = data?.pages ?? [];

  return (
    <div className="max-w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Static site pages</caption>
          <thead className="border-b border-line">
            <tr className="font-body text-micro uppercase text-ink-muted">
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
                className="border-b border-line font-body text-sm text-ink-secondary transition-colors duration-fast last:border-0 hover:bg-panel"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">
                    {staticPageLabel(page.slug as StaticPageSlug)}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-ink-faint">
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
                      'inline-flex rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
                      page.isPublished
                        ? 'border-pine/40 bg-tile-sage text-tile-sage-ink'
                        : 'border-line bg-panel text-ink-muted',
                    )}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/settings/pages/${page.slug}`}
                    className="border-b border-ink pb-0.5 font-body text-micro uppercase text-ink transition-opacity duration-fast hover:opacity-60"
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
