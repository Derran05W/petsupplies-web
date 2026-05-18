import type { AdminAnalyticsDiscountRow } from '@/types/admin-analytics';
import { formatPrice } from '@/lib/utils/format';

interface DiscountStatsPanelProps {
  items: AdminAnalyticsDiscountRow[];
  currency: string;
}

export function DiscountStatsPanel({
  items,
  currency,
}: DiscountStatsPanelProps) {
  if (items.length === 0) {
    return (
      <section
        aria-label="Discount usage"
        className="rounded-2xl border border-warm-200 bg-white p-5"
      >
        <h2 className="font-display text-lg tracking-tight text-warm-900">
          Discounts
        </h2>
        <p className="mt-2 font-body text-sm text-warm-600">
          No discount usage recorded.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Discount usage"
      className="overflow-hidden rounded-2xl border border-warm-200 bg-white"
    >
      <header className="border-b border-warm-200 px-5 py-3">
        <h2 className="font-display text-lg tracking-tight text-warm-900">
          Discounts
        </h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] font-body text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50 text-left text-xs uppercase tracking-[0.06em] text-warm-600">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 text-right font-medium">Uses</th>
              <th className="px-5 py-3 text-right font-medium">Revenue</th>
              <th className="px-5 py-3 text-right font-medium">Discounts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {items.map((row) => (
              <tr key={row.code} className="hover:bg-warm-50/80">
                <td className="px-5 py-3 font-medium text-warm-900">
                  {row.code}
                </td>
                <td className="text-warm-700 px-5 py-3 text-right tabular-nums">
                  {row.uses}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-warm-900">
                  {formatPrice(row.revenueCents, currency)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-warm-900">
                  {formatPrice(row.discountCents, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
