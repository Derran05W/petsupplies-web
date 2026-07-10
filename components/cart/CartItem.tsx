'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useCartActions } from '@/hooks/useCart';
import { type CartViewLine } from '@/types/cart';
import { CATEGORY_LABEL } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface CartItemProps {
  line: CartViewLine;
  /** When inside the drawer, clicking the product link should close it. */
  onNavigate?: () => void;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

/**
 * Cart line row in the boutique treatment: panel-toned thumbnail tile,
 * Fraunces name over an uppercase category label, hairline-pill quantity
 * stepper, and an uppercase "Remove" text button.
 */
export function CartItem({ line, onNavigate }: CartItemProps) {
  const { increment, decrement, remove } = useCartActions();

  const decDisabled = line.quantity <= 1;
  const incDisabled = line.quantity >= Math.max(1, line.stockCount);
  const lineTotal = line.priceCents * line.quantity;

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/products/${line.slug}`}
        onClick={onNavigate}
        aria-label={`View ${line.name}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-tile bg-panel"
      >
        <Image
          src={line.imageUrl.length > 0 ? line.imageUrl : FALLBACK_IMAGE}
          alt={line.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              href={`/products/${line.slug}`}
              onClick={onNavigate}
              className="font-display text-title leading-snug text-ink no-underline transition-colors duration-fast hover:text-pine"
            >
              <h3 className="truncate">{line.name}</h3>
            </Link>
            <div className="flex items-baseline gap-2.5">
              {line.category ? (
                <span className="font-body text-micro uppercase text-ink-faint">
                  {CATEGORY_LABEL[line.category]}
                </span>
              ) : null}
              <span className="font-body text-xs text-ink-muted">
                {formatPrice(line.priceCents)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => remove(line.productId)}
            aria-label={`Remove ${line.name} from cart`}
            className="shrink-0 font-body text-micro uppercase text-ink-faint transition-colors duration-fast hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            Remove
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-pill border border-line">
            <button
              type="button"
              onClick={() => decrement(line.productId)}
              disabled={decDisabled}
              aria-label={`Decrease quantity for ${line.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-l-pill transition-colors duration-fast',
                decDisabled
                  ? 'cursor-not-allowed text-ink-faint opacity-50'
                  : 'text-ink hover:bg-panel',
              )}
            >
              <Minus size={12} aria-hidden />
            </button>
            <span
              aria-live="off"
              className="inline-flex h-8 w-9 items-center justify-center font-body text-sm text-ink"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(line.productId)}
              disabled={incDisabled}
              aria-label={`Increase quantity for ${line.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-r-pill transition-colors duration-fast',
                incDisabled
                  ? 'cursor-not-allowed text-ink-faint opacity-50'
                  : 'text-ink hover:bg-panel',
              )}
            >
              <Plus size={12} aria-hidden />
            </button>
          </div>

          <p className="font-body text-sm font-semibold text-ink">
            {formatPrice(lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}
