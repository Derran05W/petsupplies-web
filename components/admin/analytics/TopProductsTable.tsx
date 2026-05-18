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
  if (items.length === 0) {
    return (
      <section
        aria-label="Top products"
        className="rounded-2xl border border-warm-200 bg-white p-5"
      >
        <h2 className="font-display text-lg tracking-tight text-warm-900">
          Top products
        </h2>
        <p className="mt-2 font-body text-sm text-warm-600">No sales yet.</p>
      </section>
    );
  }

  return (
    <section
      aria-label="Top products"
      className="overflow-hidden rounded-2xl border border-warm-200 bg-white"
    >
      <header className="border-b border-warm-200 px-5 py-3">
        <h2 className="font-display text-lg tracking-tight text-warm-900">
          Top products
        </h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] font-body text-sm">
          <thead>
            <tr className="border-b border-warm-200 bg-warm-50 text-left text-xs uppercase tracking-[0.06em] text-warm-600">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 text-right font-medium">Units</th>
              <th className="px-5 py-3 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-200">
            {items.map((row) => (
              <tr key={row.productId} className="hover:bg-warm-50/80">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/products/${row.productId}/edit`}
                    className="flex items-center gap-3 text-warm-900 hover:text-brand-600"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-warm-100">
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
                <td className="text-warm-700 px-5 py-3 text-right tabular-nums">
                  {row.unitsSold}
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-warm-900">
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
