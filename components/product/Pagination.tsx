'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const MAX_NUMBERED_LINKS = 7;

function buildPageList(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= MAX_NUMBERED_LINKS) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('ellipsis');
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

/**
 * URL-driven prev/next + numbered pagination. Reads `?page=` from the
 * current URL; emits `<Link>` elements that preserve every other search
 * param so jumping pages keeps the user's filters/search/sort intact.
 *
 * Hidden entirely when `totalPages <= 1`.
 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return qs.length > 0 ? `/products?${qs}` : '/products';
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {prevDisabled ? (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1 rounded-lg border border-warm-200 px-3 py-2 font-body text-sm text-warm-400"
        >
          <ChevronLeft size={14} aria-hidden /> Prev
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          rel="prev"
          className="inline-flex items-center gap-1 rounded-lg border border-warm-300 bg-white px-3 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          <ChevronLeft size={14} aria-hidden /> Prev
        </Link>
      )}

      <ul className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <li
              key={`ellipsis-${idx}`}
              aria-hidden
              className="px-2 font-body text-sm text-warm-400"
            >
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-lg font-body text-sm transition-colors',
                  page === currentPage
                    ? 'bg-warm-900 text-warm-50'
                    : 'border border-warm-200 bg-white text-warm-900 hover:bg-warm-100',
                )}
              >
                {page}
              </Link>
            </li>
          ),
        )}
      </ul>

      {nextDisabled ? (
        <span
          aria-disabled="true"
          className="inline-flex items-center gap-1 rounded-lg border border-warm-200 px-3 py-2 font-body text-sm text-warm-400"
        >
          Next <ChevronRight size={14} aria-hidden />
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          rel="next"
          className="inline-flex items-center gap-1 rounded-lg border border-warm-300 bg-white px-3 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          Next <ChevronRight size={14} aria-hidden />
        </Link>
      )}
    </nav>
  );
}
