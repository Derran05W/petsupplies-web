import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_LABEL, PET_TYPE_LABEL, type Product } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { RatingStars } from '@/components/product/reviews/RatingStars';

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
      className="group flex flex-col rounded-xl border border-warm-200 bg-white p-3 transition-all duration-200 hover:border-warm-300 hover:shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-warm-100">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {!product.inStock ? (
          <span className="absolute left-3 top-3 rounded-md bg-warm-900/85 px-2 py-1 font-body text-xs font-medium text-warm-50">
            Out of stock
          </span>
        ) : isOnSale ? (
          <span className="absolute left-3 top-3 rounded-md bg-brand-400 px-2 py-1 font-body text-xs font-medium text-white">
            Sale
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-col gap-2 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand-50 px-2.5 py-1 font-body text-xs font-medium text-brand-600">
              {CATEGORY_LABEL[product.category]}
            </span>
            <span className="font-body text-xs text-warm-400">
              {PET_TYPE_LABEL[product.petType]}
            </span>
          </div>
          {product.rating ? (
            <span
              className="inline-flex items-center gap-1 font-body text-xs text-warm-600"
              aria-label={`Rated ${product.rating.avg.toFixed(1)} out of 5 stars, ${product.rating.count} reviews`}
            >
              <RatingStars
                variant="aggregate"
                value={product.rating.avg}
                size={12}
                announce={false}
              />
              {product.rating.avg.toFixed(1)}
              <span className="text-warm-400">({product.rating.count})</span>
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-lg leading-snug tracking-[-0.02em] text-warm-900">
          {product.name}
        </h3>
        <p className="mt-auto flex items-baseline gap-2 font-body text-sm font-medium text-warm-900">
          <span>{formatPrice(product.priceCents)}</span>
          {isOnSale ? (
            <span className="font-normal text-warm-400 line-through">
              {formatPrice(product.compareAtPriceCents!)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
