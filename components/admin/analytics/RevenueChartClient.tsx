'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { AnalyticsRevenueRange } from '@/types/admin-analytics';
import { cn } from '@/lib/utils';
import { useAdminAnalyticsRevenueTimeseriesQuery } from '@/hooks/useAdminAnalytics';
import { ApiError } from '@/lib/api/client';
import type { RevenueChartPoint } from './RevenueChartCanvas';

const ChartLoader = () => (
  <div
    className="flex h-[280px] items-center justify-center"
    role="status"
    aria-label="Loading revenue chart"
  >
    <Loader2 size={28} className="animate-spin text-pine" />
  </div>
);

/**
 * recharts is heavy; load the chart body lazily (client-only) so it is
 * code-split out of the main admin bundle.
 */
const RevenueChartCanvas = dynamic(() => import('./RevenueChartCanvas'), {
  ssr: false,
  loading: ChartLoader,
});

const RANGES: { value: AnalyticsRevenueRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

/**
 * Interactive revenue chart — range changes refetch Phase 21 timeseries.
 */
export function RevenueChartClient() {
  const [range, setRange] = useState<AnalyticsRevenueRange>('30d');
  const { data, isPending, isError, error } =
    useAdminAnalyticsRevenueTimeseriesQuery(range);

  const currency = data?.currency ?? 'cad';

  const chartData = useMemo<RevenueChartPoint[]>(() => {
    if (!data?.points?.length) return [];
    return data.points.map((p) => ({
      ...p,
      shortDate: p.date.slice(0, 10),
      revenueDollars: p.revenueCents / 100,
    }));
  }, [data]);

  return (
    <section
      aria-label="Revenue over time"
      className="rounded-card border border-line bg-paper p-5"
    >
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl text-ink">Revenue</h2>
        <div
          role="tablist"
          aria-label="Date range"
          className="flex flex-wrap gap-2"
        >
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              role="tab"
              aria-selected={range === r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-pill border px-3 py-1.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                range === r.value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-transparent text-ink-muted hover:bg-panel hover:text-ink',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {isPending && <ChartLoader />}
      {isError && (
        <p role="alert" className="font-body text-sm text-danger-solid">
          {error instanceof ApiError
            ? error.message
            : 'Could not load revenue data.'}
        </p>
      )}
      {!isPending && !isError && chartData.length === 0 && (
        <p className="font-body text-sm text-ink-muted">
          No revenue in this period yet.
        </p>
      )}
      {!isPending && !isError && chartData.length > 0 && (
        <RevenueChartCanvas data={chartData} currency={currency} />
      )}
    </section>
  );
}
