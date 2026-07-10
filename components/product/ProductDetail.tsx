import Link from 'next/link';
import { Truck } from 'lucide-react';
import { CATEGORY_LABEL, PET_TYPE_LABEL, type Product } from '@/types/product';
import { formatPrice } from '@/lib/utils/format';
import { formatFreeShippingLabel } from '@/lib/site/shipping-copy';
import { ImageGallery } from './ImageGallery';
import { QuantitySelector } from './QuantitySelector';
import { SubscribeAndSavePanel } from './SubscribeAndSavePanel';
import { BackInStockPanel } from './BackInStockPanel';
import { NutritionalAccordion } from './NutritionalAccordion';
import { RatingStars } from '@/components/product/reviews/RatingStars';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface ProductDetailProps {
  product: Product;
  freeShippingThresholdCents: number;
}

export function ProductDetail({
  product,
  freeShippingThresholdCents,
}: ProductDetailProps) {
  const isOnSale =
    typeof product.compareAtPriceCents === 'number' &&
    product.compareAtPriceCents > product.priceCents;

  return (
    <article className="bg-paper px-gutter pb-16 pt-8 text-ink md:pt-12">
      <div className="mx-auto max-w-wrap">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 font-body text-micro uppercase text-ink-muted"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/products"
                className="transition-colors duration-fast hover:text-ink"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden className="text-ink-faint">
              /
            </li>
            <li aria-current="page" className="truncate text-ink">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <ImageGallery productName={product.name} images={product.images} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 font-body text-kicker uppercase">
              <span className="text-pine">
                {CATEGORY_LABEL[product.category]}
              </span>
              <span className="text-ink-faint">
                {PET_TYPE_LABEL[product.petType]}
              </span>
            </div>

            <h1 className="font-display text-display text-ink">
              {product.name}
            </h1>

            {product.rating ? (
              <a
                href="#reviews"
                role="img"
                aria-label={`Rated ${product.rating.avg.toFixed(1)} out of 5 stars based on ${product.rating.count} reviews — jump to customer reviews`}
                className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
              >
                <RatingStars
                  variant="aggregate"
                  value={product.rating.avg}
                  size={14}
                  announce={false}
                />
                <span className="font-medium">
                  {product.rating.avg.toFixed(1)}
                </span>
                <span className="text-ink-muted">
                  ({product.rating.count}{' '}
                  {product.rating.count === 1 ? 'review' : 'reviews'})
                </span>
              </a>
            ) : null}

            <p className="flex items-baseline gap-3">
              <span className="font-display text-3xl tracking-[-0.02em] text-ink">
                {formatPrice(product.priceCents)}
              </span>
              {isOnSale ? (
                <span className="font-body text-lg text-ink-faint line-through">
                  {formatPrice(product.compareAtPriceCents!)}
                </span>
              ) : null}
            </p>

            <p className="font-body text-lede leading-body text-ink-secondary">
              {product.description}
            </p>

            {product.subscription?.enabled && product.inStock ? (
              <SubscribeAndSavePanel product={product} />
            ) : product.subscription?.enabled && !product.inStock ? (
              <div className="flex flex-col gap-5 rounded-card border border-line bg-panel p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border-pine/40 inline-flex items-center gap-1.5 rounded-tag border bg-tile-sage px-2 py-0.5 font-body text-micro uppercase text-tile-sage-ink">
                    Subscribe &amp; Save — save{' '}
                    {product.subscription.discountPercent}%
                  </span>
                </div>
                <p
                  className="font-body text-sm text-ink-secondary"
                  role="status"
                >
                  This item is out of stock. Turn on alerts below—you can
                  subscribe once it&apos;s available again.
                </p>
                <BackInStockPanel product={product} />
              </div>
            ) : !product.inStock ? (
              <>
                <QuantitySelector product={product} />
                <BackInStockPanel product={product} />
              </>
            ) : (
              <QuantitySelector product={product} />
            )}

            <WishlistButton product={product} variant="inline" />

            <p className="inline-flex items-center gap-2 font-body text-xs text-ink-muted">
              <Truck size={14} aria-hidden className="text-pine" />
              {formatFreeShippingLabel(freeShippingThresholdCents)}
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
