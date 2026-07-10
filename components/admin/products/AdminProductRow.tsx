import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Sparkles } from 'lucide-react';
import type { AdminProduct } from '@/types/admin';
import { ADMIN_PRODUCT_CATEGORY_LABEL } from '@/types/admin-product-api';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { StockBadge } from './StockBadge';

interface AdminProductRowProps {
  product: AdminProduct;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

export function AdminProductRow({ product }: AdminProductRowProps) {
  const primary =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <tr className="border-b border-line transition-colors duration-fast last:border-b-0 hover:bg-panel">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-tile bg-panel">
            <Image
              src={
                primary?.url && primary.url.length > 0
                  ? primary.url
                  : FALLBACK_IMAGE
              }
              alt={primary?.alt ?? product.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-body text-sm font-medium text-ink">
              {product.name}
            </p>
            <p className="truncate font-body text-xs text-ink-muted">
              /{product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-body text-sm text-ink-secondary">
        {ADMIN_PRODUCT_CATEGORY_LABEL[product.category]}
      </td>
      <td className="px-4 py-3 font-display text-sm text-ink">
        {formatPrice(product.priceCents)}
      </td>
      <td className="px-4 py-3">
        <StockBadge stockCount={product.stockCount} />
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span
          className={cn(
            'inline-flex items-center rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
            product.isPublished
              ? 'border-pine/40 bg-tile-sage text-tile-sage-ink'
              : 'border-line bg-panel text-ink-muted',
          )}
        >
          {product.isPublished ? 'Active' : 'Draft'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 rounded-pill border border-line bg-transparent px-3 py-1 font-body text-micro uppercase text-ink transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            <Pencil size={12} aria-hidden />
            Edit
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit?focus=description`}
            aria-label={`Generate description for ${product.name}`}
            className="border-pine/40 inline-flex items-center gap-1 rounded-pill border bg-transparent px-3 py-1 font-body text-micro uppercase text-pine transition-colors duration-fast hover:border-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            <Sparkles size={12} aria-hidden />
            AI
          </Link>
        </div>
      </td>
    </tr>
  );
}
