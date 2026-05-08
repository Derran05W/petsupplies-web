import Link from 'next/link';
import Image from 'next/image';
import { Pencil, Sparkles } from 'lucide-react';
import type { AdminProduct } from '@/types/admin';
import { CATEGORY_LABEL, PET_TYPE_LABEL } from '@/types/product';
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
    <tr className="border-b border-warm-200 last:border-b-0 hover:bg-warm-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-warm-100">
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
            <p className="truncate font-body text-sm font-medium text-warm-900">
              {product.name}
            </p>
            <p className="truncate font-body text-xs text-warm-600">
              /{product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 font-body text-sm text-warm-900 md:table-cell">
        {CATEGORY_LABEL[product.category]}
      </td>
      <td className="hidden px-4 py-3 font-body text-sm text-warm-900 md:table-cell">
        {PET_TYPE_LABEL[product.petType]}
      </td>
      <td className="px-4 py-3 font-body text-sm font-medium text-warm-900">
        {formatPrice(product.priceCents)}
      </td>
      <td className="px-4 py-3">
        <StockBadge stockCount={product.stockCount} />
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span
          className={cn(
            'inline-flex items-center rounded-md px-2 py-0.5 font-body text-xs font-medium',
            product.isPublished
              ? 'bg-brand-50 text-brand-600'
              : 'bg-warm-100 text-warm-600',
          )}
        >
          {product.isPublished ? 'Active' : 'Draft'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-1 rounded-md border border-warm-300 bg-white px-2.5 py-1 font-body text-xs text-warm-900 transition-colors hover:bg-warm-100"
          >
            <Pencil size={12} aria-hidden />
            Edit
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit?focus=description`}
            aria-label={`Generate description for ${product.name}`}
            className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 font-body text-xs text-brand-700 transition-colors hover:bg-brand-100"
          >
            <Sparkles size={12} aria-hidden />
            AI
          </Link>
        </div>
      </td>
    </tr>
  );
}
