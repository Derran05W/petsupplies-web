import Link from 'next/link';
import { Star, Truck } from 'lucide-react';
import { CATEGORY_LABEL, PET_TYPE_LABEL, type Product } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { ImageGallery } from './ImageGallery';
import { QuantitySelector } from './QuantitySelector';
import { NutritionalAccordion } from './NutritionalAccordion';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const isOnSale =
    typeof product.compareAtPriceCents === 'number' &&
    product.compareAtPriceCents > product.priceCents;

  return (
    <article className="px-6 pb-16 pt-8 md:px-8 md:pt-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 font-body text-sm text-warm-600"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/products"
                className="transition-colors hover:text-warm-900"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden className="text-warm-300">
              /
            </li>
            <li
              aria-current="page"
              className="truncate font-medium text-warm-900"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <ImageGallery productName={product.name} images={product.images} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-50 px-2.5 py-1 font-body text-xs font-medium text-brand-600">
                {CATEGORY_LABEL[product.category]}
              </span>
              <span className="font-body text-xs text-warm-400">
                {PET_TYPE_LABEL[product.petType]}
              </span>
            </div>

            <h1 className="font-display text-4xl leading-tight tracking-[-0.02em] text-warm-900 md:text-5xl">
              {product.name}
            </h1>

            {product.rating ? (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-warm-100 px-2.5 py-1.5 font-body text-sm text-warm-900">
                <Star
                  size={14}
                  aria-hidden
                  className="fill-brand-400 text-brand-400"
                />
                <span className="font-medium">
                  {product.rating.avg.toFixed(1)}
                </span>
                <span className="text-warm-600">
                  ({product.rating.count}{' '}
                  {product.rating.count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            ) : null}

            <p className="flex items-baseline gap-3">
              <span className="font-display text-3xl tracking-[-0.02em] text-warm-900">
                {formatPrice(product.priceCents)}
              </span>
              {isOnSale ? (
                <span className="font-body text-lg text-warm-400 line-through">
                  {formatPrice(product.compareAtPriceCents!)}
                </span>
              ) : null}
            </p>

            <p className="font-body text-base leading-relaxed text-warm-600">
              {product.description}
            </p>

            <QuantitySelector
              inStock={product.inStock}
              stockCount={product.stockCount}
            />

            <p className="inline-flex items-center gap-2 font-body text-xs text-warm-600">
              <Truck size={14} aria-hidden className="text-brand-600" />
              Free shipping on orders over $50
            </p>

            {product.nutritionalInfo ? (
              <NutritionalAccordion info={product.nutritionalInfo} />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
