import { Loader2 } from 'lucide-react';

function StatCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-warm-200 bg-surface-card p-5"
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 animate-pulse rounded bg-warm-100" />
        <div className="size-8 animate-pulse rounded-full bg-warm-100" />
      </div>
      <div className="h-9 w-28 animate-pulse rounded bg-warm-100" />
    </div>
  );
}

export function AnalyticsOverviewSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading analytics overview"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </section>
  );
}

export function AnalyticsChartSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading revenue chart"
      className="rounded-2xl border border-warm-200 bg-surface-card p-5"
      role="status"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-warm-100" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-8 w-16 animate-pulse rounded-lg bg-warm-100"
            />
          ))}
        </div>
      </div>
      <div className="flex h-[280px] items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-brand-500"
          aria-hidden
        />
        <span className="sr-only">Loading chart</span>
      </div>
    </section>
  );
}

interface AnalyticsPanelSkeletonProps {
  title: string;
  rows?: number;
}

export function AnalyticsPanelSkeleton({
  title,
  rows = 4,
}: AnalyticsPanelSkeletonProps) {
  return (
    <section
      aria-busy="true"
      aria-label={`Loading ${title}`}
      className="rounded-2xl border border-warm-200 bg-surface-card p-5"
      role="status"
    >
      <div className="h-6 w-40 animate-pulse rounded bg-warm-100" />
      <ul className="mt-4 flex flex-col gap-3">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="size-10 shrink-0 animate-pulse rounded-lg bg-warm-100" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-warm-100" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-warm-100" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
