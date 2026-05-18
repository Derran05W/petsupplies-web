import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, PackageX } from 'lucide-react';
import type { AdminAnalyticsLowStockRow } from '@/types/admin-analytics';

interface LowStockAnalyticsPanelProps {
  items: AdminAnalyticsLowStockRow[];
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

export function LowStockAnalyticsPanel({ items }: LowStockAnalyticsPanelProps) {
  if (items.length === 0) {
    return (
      <section
        aria-label="Low stock from analytics"
        className="flex items-center gap-3 rounded-2xl border border-warm-200 bg-white px-5 py-4"
      >
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <PackageX size={16} />
        </span>
        <p className="font-body text-sm text-warm-600">
          No low-stock products in this report.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Low stock from analytics"
      className="rounded-2xl border border-warm-200 bg-white"
    >
      <header className="flex items-center justify-between border-b border-warm-200 px-5 py-3">
        <h2 className="font-body text-sm font-medium text-warm-900">
          Low-stock products
        </h2>
        <Link
          href="/admin/products?stock=low"
          className="inline-flex items-center gap-1 font-body text-xs font-medium uppercase tracking-[0.06em] text-brand-600 hover:text-brand-700"
        >
          Manage catalog
          <ChevronRight size={12} aria-hidden />
        </Link>
      </header>
      <ul className="flex flex-col divide-y divide-warm-200">
        {items.map((product) => (
          <li key={product.id}>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-warm-50"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-warm-100">
                <Image
                  src={
                    product.primaryImageUrl?.length
                      ? product.primaryImageUrl
                      : FALLBACK_IMAGE
                  }
                  alt=""
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-warm-900 group-hover:text-brand-700">
                  {product.name}
                </p>
                <p className="font-body text-xs text-warm-600">
                  {product.stockCount} in stock
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
