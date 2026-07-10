import Link from 'next/link';
import { cn } from '@/lib/utils';

const ARROW_LINK_CLASSES =
  'inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink no-underline opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine';

const ARROW_DISABLED_CLASSES =
  'inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink-faint opacity-60';

interface OrdersPaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base path (without query). The component appends `?page=N`. */
  basePath?: string;
  /**
   * Additional query parameters to preserve on every page link. Used by
   * Phase 8's `/admin/products` (search + stock filters) and
   * `/admin/orders` (status filter) so paginating doesn't drop the
   * filter state. Defaults to no extras — matches the original
   * Phase 7 behaviour for `/account` callers.
   */
  extraQuery?: Record<string, string | undefined>;
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
 * Server-rendered pagination for the orders list. Mirrors Phase 4's
 * product `<Pagination />` shape (real `<Link>`s, `aria-current="page"`,
 * prefetch-on-hover) but accepts a configurable `basePath` so it isn't
 * tied to `/products`.
 *
 * Hidden when `totalPages <= 1`.
 */
export function OrdersPagination({
  currentPage,
  totalPages,
  basePath = '/account',
  extraQuery,
}: OrdersPaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number): string => {
    const params = new URLSearchParams();
    if (extraQuery) {
      for (const [key, value] of Object.entries(extraQuery)) {
        if (value && value.length > 0) params.set(key, value);
      }
    }
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    return qs.length > 0 ? `${basePath}?${qs}` : basePath;
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Orders pagination"
      className="mt-8 flex items-center justify-center gap-5"
    >
      {prevDisabled ? (
        <span aria-disabled="true" className={ARROW_DISABLED_CLASSES}>
          <span aria-hidden>←</span> Prev
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          rel="prev"
          className={ARROW_LINK_CLASSES}
        >
          <span aria-hidden>←</span> Prev
        </Link>
      )}

      <ul className="flex items-center gap-2">
        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <li
              key={`ellipsis-${idx}`}
              aria-hidden
              className="px-1 font-body text-sm text-ink-faint"
            >
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={buildHref(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full border font-body text-sm no-underline transition-all duration-base ease-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
                  page === currentPage
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink hover:border-ink',
                )}
              >
                {page}
              </Link>
            </li>
          ),
        )}
      </ul>

      {nextDisabled ? (
        <span aria-disabled="true" className={ARROW_DISABLED_CLASSES}>
          Next <span aria-hidden>→</span>
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          rel="next"
          className={ARROW_LINK_CLASSES}
        >
          Next <span aria-hidden>→</span>
        </Link>
      )}
    </nav>
  );
}
