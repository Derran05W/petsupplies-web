import Link from 'next/link';
import Image from 'next/image';
import type { AdminAnalyticsTopProductRow } from '@/types/admin-analytics';
import { formatPrice } from '@/lib/utils/format';

interface TopProductsTableProps {
  items: AdminAnalyticsTopProductRow[];
  currency: string;
}

const PLACEHOLDER = '/images/hero-placeholder.jpg';

export function TopProductsTable({ items, currency }: TopProductsTableProps) {
  const rows = items ?? [];
  if (rows.length === 0) {
    return (
      <section
        aria-label="Top products"
        className="rounded-card border border-line bg-paper p-5"
      >
        <h2 className="font-display text-xl text-ink">Top products</h2>
        <p className="mt-2 font-body text-sm text-ink-muted">No sales yet.</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Top products"
      className="overflow-hidden rounded-card border border-line bg-paper"
    >
      <header className="border-b border-line px-5 py-3">
        <h2 className="font-display text-xl text-ink">Top products</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] font-body text-sm">
          <thead>
            <tr className="border-b border-line text-left font-body text-micro uppercase text-ink-muted">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3 text-right">Units</th>
              <th className="px-5 py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={row.productId}
                className="transition-colors duration-fast hover:bg-panel"
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/products/${row.productId}/edit`}
                    className="flex items-center gap-3 text-ink transition-colors duration-fast hover:text-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-tile bg-panel">
                      <Image
                        src={row.imageUrl?.length ? row.imageUrl : PLACEHOLDER}
                        alt=""
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{row.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-ink-secondary">
                  {row.unitsSold}
                </td>
                <td className="px-5 py-3 text-right font-display tabular-nums text-ink">
                  {formatPrice(row.revenueCents, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
