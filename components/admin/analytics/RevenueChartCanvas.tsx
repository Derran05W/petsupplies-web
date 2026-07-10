'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '@/lib/utils/format';

export interface RevenueChartPoint {
  date: string;
  revenueCents: number;
  orderCount: number;
  shortDate: string;
  revenueDollars: number;
}

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
 * The recharts-dependent chart body. Imported via `next/dynamic` (ssr:false)
 * from RevenueChartClient so recharts is code-split out of the main admin
 * bundle and only downloaded when the analytics chart actually renders.
 */
export default function RevenueChartCanvas({
  data,
  currency,
}: {
  data: RevenueChartPoint[];
  currency: string;
}) {
  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
  );
}
