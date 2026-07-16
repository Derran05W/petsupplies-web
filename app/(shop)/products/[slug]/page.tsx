import { type Metadata } from 'next';
import { Suspense } from 'react';
import { brand } from '@/lib/config/brand';
import { getProductBySlug } from '@/lib/api/products';
import type { Product } from '@/types/product';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { ProductDetailSection } from '@/components/product/sections/ProductDetailSection';
import { RelatedProductsSkeleton } from '@/components/product/RelatedProductsSkeleton';
import { RelatedProductsSection } from '@/components/product/sections/RelatedProductsSection';
import { ReviewsSection } from '@/components/product/reviews/ReviewsSection';
import { ReviewSkeleton } from '@/components/product/reviews/ReviewSkeleton';
import { parseReviewListingParams } from '@/lib/utils/searchParams';

interface ProductDetailPageProps {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product not found' };
  }
  const canonical = `/products/${product.slug}`;
  const images = product.images
    .filter((image) => image.url.length > 0)
    .map((image) => ({
      url: image.url,
      alt: image.alt || product.name,
    }));
  return {
    title: product.name,
    description: product.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${product.name} · ${brand.name}`,
      description: product.description,
      url: canonical,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} · ${brand.name}`,
      description: product.description,
      images: images.map((image) => image.url),
    },
  };
}

/**
 * Serialize a JSON-LD object for inline embedding. `<` is escaped so a
 * value containing `</script>` (or any other markup) can't break out of
 * the surrounding <script> tag.
 */
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function buildProductJsonLd(product: Product): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images
      .filter((image) => image.url.length > 0)
      .map((image) => image.url),
    offers: {
      '@type': 'Offer',
      // Store ships to Canada only; every price is CAD. schema.org consumers
      // read this literally, so it must match the on-page `$` amounts.
      priceCurrency: 'CAD',
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  if (product.rating && product.rating.count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.avg,
      reviewCount: product.rating.count,
    };
  }

  return jsonLd;
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);
  const { page: reviewsPage, sort: reviewsSort } =
    parseReviewListingParams(searchParams);

  const reviewsSuspenseKey = `reviews-${params.slug}-${reviewsPage}-${reviewsSort}`;
  const relatedSuspenseKey = `related-${params.slug}`;

  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          // JSON-LD is serialized with `<` escaped; safe to inline.
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildProductJsonLd(product)),
          }}
        />
      ) : null}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailSection slug={params.slug} />
      </Suspense>
      <div className="bg-paper px-gutter pb-24 text-ink">
        <div className="mx-auto max-w-wrap">
          <Suspense fallback={<ReviewSkeleton />} key={reviewsSuspenseKey}>
            <ReviewsSection
              slug={params.slug}
              page={reviewsPage}
              sort={reviewsSort}
            />
          </Suspense>
          <Suspense
            fallback={<RelatedProductsSkeleton />}
            key={relatedSuspenseKey}
          >
            <RelatedProductsSection slug={params.slug} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
