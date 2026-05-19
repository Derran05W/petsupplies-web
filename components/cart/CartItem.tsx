'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartActions } from '@/hooks/useCart';
import { type CartLine } from '@/lib/store/cart';
import { CATEGORY_LABEL } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface CartItemProps {
  line: CartLine;
  /** When inside the drawer, clicking the product link should close it. */
  onNavigate?: () => void;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

export function CartItem({ line, onNavigate }: CartItemProps) {
  const { increment, decrement, remove } = useCartActions();

  const decDisabled = line.quantity <= 1;
  const incDisabled = line.quantity >= Math.max(1, line.stockCount);
  const lineTotal = line.priceCents * line.quantity;

  return (
    <li className="flex gap-4 py-4">
      <Link
        href={`/products/${line.slug}`}
        onClick={onNavigate}
        aria-label={`View ${line.name}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-warm-100"
      >
        <Image
          src={line.imageUrl.length > 0 ? line.imageUrl : FALLBACK_IMAGE}
          alt={line.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Link
              href={`/products/${line.slug}`}
              onClick={onNavigate}
              className="font-display text-base leading-snug tracking-[-0.02em] text-warm-900 transition-colors hover:text-brand-600"
            >
              <h3 className="truncate">{line.name}</h3>
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-50 px-2 py-0.5 font-body text-[11px] font-medium text-brand-600">
                {CATEGORY_LABEL[line.category]}
              </span>
              <span className="font-body text-xs text-warm-600">
                {formatPrice(line.priceCents)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => remove(line.productId)}
            aria-label={`Remove ${line.name} from cart`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-900"
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-lg border border-warm-300 bg-warm-100">
            <button
              type="button"
              onClick={() => decrement(line.productId)}
              disabled={decDisabled}
              aria-label={`Decrease quantity for ${line.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-l-lg transition-colors',
                decDisabled
                  ? 'cursor-not-allowed text-warm-400'
                  : 'text-warm-900 hover:bg-warm-100',
              )}
            >
              <Minus size={12} aria-hidden />
            </button>
            <span
              aria-live="off"
              className="inline-flex h-8 w-9 items-center justify-center border-x border-warm-300 font-body text-sm text-warm-900"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(line.productId)}
              disabled={incDisabled}
              aria-label={`Increase quantity for ${line.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-r-lg transition-colors',
                incDisabled
                  ? 'cursor-not-allowed text-warm-400'
                  : 'text-warm-900 hover:bg-warm-100',
              )}
            >
              <Plus size={12} aria-hidden />
            </button>
          </div>

          <p className="font-body text-sm font-medium text-warm-900">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}
