import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_LABEL, PET_TYPE_LABEL, type Product } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { TONE_CLASSES } from '@/components/ui/tones';
import { cn } from '@/lib/utils';
import { RatingStars } from '@/components/product/reviews/RatingStars';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductCardProps {
  product: Product;
}

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

function pickPrimaryImage(product: Product): { url: string; alt: string } {
  const primary = product.images.find((image) => image.isPrimary);
  const first = product.images[0];
  const chosen = primary ?? first;
  if (!chosen) {
    return { url: FALLBACK_IMAGE, alt: product.name };
  }
  return { url: chosen.url, alt: chosen.alt || product.name };
}

export function ProductCard({ product }: ProductCardProps) {
  const { url: imageUrl, alt: imageAlt } = pickPrimaryImage(product);
  const isOnSale =
    typeof product.compareAtPriceCents === 'number' &&
    product.compareAtPriceCents > product.priceCents;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block no-underline"
    >
      <div
        className={cn(
          'relative aspect-square overflow-hidden rounded-tile',
          TONE_CLASSES.amber,
        )}
      >
        <WishlistButton product={product} variant="overlay" />
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-slow ease-soft group-hover:scale-[1.06] motion-reduce:transform-none"
        />
        {!product.inStock ? (
          <span className="absolute left-3 top-3 rounded-tag bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] px-2 py-1 font-body text-micro uppercase text-ink-muted">
            Out of stock
          </span>
        ) : isOnSale ? (
          <span className="border-amber/40 absolute left-3 top-3 rounded-tag border bg-tile-amber px-2 py-1 font-body text-micro uppercase text-tile-amber-ink">
            Sale
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-body text-micro uppercase">
            <span className="text-pine">
              {CATEGORY_LABEL[product.category]}
            </span>
            <span className="text-ink-faint">
              {PET_TYPE_LABEL[product.petType]}
            </span>
          </div>
          {product.rating ? (
            <span
              className="inline-flex items-center gap-1 font-body text-xs text-ink-muted"
              aria-label={`Rated ${product.rating.avg.toFixed(1)} out of 5 stars, ${product.rating.count} reviews`}
            >
              <RatingStars
                variant="aggregate"
                value={product.rating.avg}
                size={12}
                announce={false}
              />
              {product.rating.avg.toFixed(1)}
              <span className="text-ink-faint">({product.rating.count})</span>
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-title text-ink">{product.name}</h3>
        <p className="mt-auto flex items-baseline gap-2 font-body text-sm font-semibold text-ink">
          <span>{formatPrice(product.priceCents)}</span>
          {isOnSale ? (
            <span className="font-normal text-ink-faint line-through">
              {formatPrice(product.compareAtPriceCents!)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
