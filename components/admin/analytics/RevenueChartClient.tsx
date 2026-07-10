'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalyticsRevenueRange } from '@/types/admin-analytics';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import { useAdminAnalyticsRevenueTimeseriesQuery } from '@/hooks/useAdminAnalytics';
import { ApiError } from '@/lib/api/client';

const RANGES: { value: AnalyticsRevenueRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as {
    date: string;
    revenueCents: number;
    orderCount: number;
  };
  if (!row) return null;
  return (
    <div className="rounded-tile border border-line bg-paper px-3 py-2 font-body text-xs shadow-lifted">
      <p className="font-medium text-ink">{row.date}</p>
      <p className="text-ink-muted">
        {formatPrice(row.revenueCents, currency)} · {row.orderCount} orders
      </p>
    </div>
  );
}

/**
 * Interactive revenue chart — range changes refetch Phase 21 timeseries.
 */
export function RevenueChartClient() {
  const [range, setRange] = useState<AnalyticsRevenueRange>('30d');
  const { data, isPending, isError, error } =
    useAdminAnalyticsRevenueTimeseriesQuery(range);

  const currency = data?.currency ?? 'usd';

  const chartData = useMemo(() => {
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

      {isPending && (
        <div
          className="flex h-[280px] items-center justify-center"
          role="status"
          aria-label="Loading revenue chart"
        >
          <Loader2 size={28} className="animate-spin text-pine" />
        </div>
      )}
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
        <div className="h-[280px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--ink-muted)' }}
                tickLine={false}
                tickFormatter={(v) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.toUpperCase(),
                    maximumFractionDigits: 0,
                  }).format(Number(v))
                }
              />
              <Tooltip
                content={<ChartTooltip currency={currency} />}
                cursor={{
                  stroke: 'var(--pine)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenueDollars"
                stroke="var(--pine)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--pine)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
