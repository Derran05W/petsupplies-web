import Link from 'next/link';
import Image from 'next/image';
import { PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types/admin';

interface LowStockListProps {
  products: DashboardStats['lowStockProducts'];
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

export function LowStockList({ products }: LowStockListProps) {
  if (products.length === 0) {
    return (
      <section
        aria-label="Low stock alerts"
        className="flex items-center gap-3 rounded-card border border-line bg-paper px-5 py-4"
      >
        <span
          aria-hidden
          className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-panel text-pine"
        >
          <PackageX size={16} />
        </span>
        <p className="font-body text-sm text-ink-secondary">
          Every product is comfortably stocked.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Low stock alerts"
      className="rounded-card border border-line bg-paper"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="font-display text-xl text-ink">Low-stock products</h2>
        <Link
          href="/admin/products?stock=low"
          className="inline-flex items-center gap-1 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          View all
          <span aria-hidden>→</span>
        </Link>
      </header>
      <ul className="flex flex-col divide-y divide-line">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="group flex items-center gap-4 px-5 py-3 transition-colors duration-fast hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-tile bg-panel">
                <Image
                  src={
                    product.primaryImageUrl.length > 0
                      ? product.primaryImageUrl
                      : FALLBACK_IMAGE
                  }
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-ink">
                  {product.name}
                </p>
                <p
                  className={cn(
                    'font-body text-xs',
                    product.stockCount === 0
                      ? 'text-danger-solid'
                      : 'text-amber',
                  )}
                >
                  {product.stockCount === 0
                    ? 'Out of stock'
                    : `${product.stockCount} left`}
                </p>
              </div>
              <span
                aria-hidden
                className="text-ink-faint transition-colors duration-fast group-hover:text-ink-muted"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
