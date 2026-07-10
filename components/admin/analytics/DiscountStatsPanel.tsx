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
        className="rounded-card border border-line bg-paper p-5"
      >
        <h2 className="font-display text-xl text-ink">Discounts</h2>
        <p className="mt-2 font-body text-sm text-ink-muted">
          No discount usage recorded.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Discount usage"
      className="overflow-hidden rounded-card border border-line bg-paper"
    >
      <header className="border-b border-line px-5 py-3">
        <h2 className="font-display text-xl text-ink">Discounts</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] font-body text-sm">
          <thead>
            <tr className="border-b border-line text-left font-body text-micro uppercase text-ink-muted">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3 text-right">Uses</th>
              <th className="px-5 py-3 text-right">Revenue</th>
              <th className="px-5 py-3 text-right">Discounts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((row) => (
              <tr
                key={row.code}
                className="transition-colors duration-fast hover:bg-panel"
              >
                <td className="px-5 py-3 font-medium text-ink">{row.code}</td>
                <td className="px-5 py-3 text-right tabular-nums text-ink-secondary">
                  {row.uses}
                </td>
                <td className="px-5 py-3 text-right font-display tabular-nums text-ink">
                  {formatPrice(row.revenueCents, currency)}
                </td>
                <td className="px-5 py-3 text-right font-display tabular-nums text-ink">
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
