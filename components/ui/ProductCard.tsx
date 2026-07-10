'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CATEGORY_LABEL,
  PET_TYPE_LABEL,
  type Category,
  type Product,
} from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { useCartActions } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { PetIcon, type PetIconName } from './PetIcon';
import { TONE_CLASSES, type TileTone } from './tones';

const CATEGORY_ICON: Record<Category, PetIconName> = {
  food: 'bowl',
  treats: 'bone',
  accessories: 'yarn',
  healthcare: 'paw',
};

const ADDED_FEEDBACK_MS = 1200;

interface ProductCardProps {
  product: Product;
  /** Gradient tile behind the image — shows through for icon fallbacks and while photos load. */
  tone?: TileTone;
  /**
   * Rendered inside the image tile, above the scrim (e.g. a wishlist
   * heart). Kept as a slot so this ui component stays free of feature
   * dependencies.
   */
  overlaySlot?: React.ReactNode;
  className?: string;
}

/**
 * Image-first product card from the mockup (`.prod`):
 *   - 4:5 image on a tonal gradient tile; hover zooms the image and drops
 *     a 5% ink scrim over it
 *   - "Quick add" pill (`.quick`) slides up from the bottom edge on hover /
 *     focus, adds to cart, and flips to "Added ✓" for 1.2s
 *   - meta row: Fraunces name + uppercase "Pet · Category" label left,
 *     price right
 * Products without photos fall back to a line-art category icon, keeping
 * the exact icon hover (scale 1.1, -3° tilt).
 */
export function ProductCard({
  product,
  tone = 'amber',
  overlaySlot,
  className,
}: ProductCardProps) {
  const { add } = useCartActions();
  const [added, setAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const primary =
    product.images.find((image) => image.isPrimary) ?? product.images[0];
  const isOnSale =
    typeof product.compareAtPriceCents === 'number' &&
    product.compareAtPriceCents > product.priceCents;

  function handleQuickAdd(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    add(product);
    setAdded(true);
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn('group relative block no-underline', className)}
    >
      <div
        className={cn(
          'relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-tile',
          TONE_CLASSES[tone],
        )}
      >
        {primary && !imgFailed ? (
          <Image
            src={primary.url}
            alt={primary.alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-slow ease-soft group-hover:scale-[1.06] motion-reduce:transform-none"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <PetIcon
            name={CATEGORY_ICON[product.category]}
            className="h-[44%] w-[44%] transition-transform duration-slow ease-soft group-hover:-rotate-3 group-hover:scale-110 motion-reduce:transform-none"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-ink opacity-0 transition-opacity duration-base group-hover:opacity-5"
        />
        {overlaySlot}
        {product.inStock ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-[14px] left-1/2 z-[3] -translate-x-1/2 translate-y-[10px] rounded-pill bg-paper px-6 py-3 font-body text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink opacity-0 transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0"
          >
            {added ? 'Added ✓' : 'Quick add'}
            <span className="sr-only"> — {product.name}</span>
          </button>
        ) : (
          <span className="absolute bottom-[14px] left-1/2 z-[3] -translate-x-1/2 rounded-pill bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] px-6 py-3 font-body text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-muted">
            Out of stock
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-display text-title text-ink">{product.name}</h3>
          <div className="mt-0.5 font-body text-micro uppercase text-ink-muted">
            {PET_TYPE_LABEL[product.petType]} ·{' '}
            {CATEGORY_LABEL[product.category]}
            {product.rating ? (
              <span
                aria-label={`Rated ${product.rating.avg.toFixed(1)} out of 5 stars, ${product.rating.count} reviews`}
              >
                {' '}
                · <span aria-hidden>★</span> {product.rating.avg.toFixed(1)} (
                {product.rating.count})
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-baseline gap-2 font-body text-[0.95rem] font-semibold text-ink">
          {formatPrice(product.priceCents)}
          {isOnSale ? (
            <span className="font-normal text-ink-muted line-through">
              {formatPrice(product.compareAtPriceCents!)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
