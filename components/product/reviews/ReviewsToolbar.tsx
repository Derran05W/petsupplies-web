'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReviewSort } from '@/types/review';

const REVIEW_SORT_LABEL: Record<ReviewSort, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  rating_desc: 'Highest rated',
  rating_asc: 'Lowest rated',
};

const SORT_OPTIONS: ReviewSort[] = [
  'newest',
  'oldest',
  'rating_desc',
  'rating_asc',
];

interface ReviewsToolbarProps {
  page: number;
  totalPages: number;
  sort: ReviewSort;
}

export function ReviewsToolbar({
  page,
  totalPages,
  sort,
}: ReviewsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const replaceQuery = (mutate: (params: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const qs = next.toString();
    router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname, {
      scroll: false,
    });
  };

  const handleSort = (value: string) => {
    replaceQuery((params) => {
      params.set('reviewsSort', value);
      params.delete('reviewsPage');
    });
  };

  const goPrev = () => {
    if (page <= 1) return;
    replaceQuery((params) => {
      const target = page - 1;
      if (target <= 1) params.delete('reviewsPage');
      else params.set('reviewsPage', String(target));
    });
  };

  const goNext = () => {
    if (page >= totalPages) return;
    replaceQuery((params) => {
      params.set('reviewsPage', String(page + 1));
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="inline-flex items-center gap-2 font-body text-sm text-warm-600">
        <span>Sort</span>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {SORT_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {REVIEW_SORT_LABEL[key]}
            </option>
          ))}
        </select>
      </label>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-3 font-body text-sm text-warm-600">
          <span className="tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1}
              className="rounded-lg border border-warm-300 bg-surface-card px-3 py-1.5 font-medium text-warm-900 transition-colors hover:border-warm-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages}
              className="rounded-lg border border-warm-300 bg-surface-card px-3 py-1.5 font-medium text-warm-900 transition-colors hover:border-warm-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
