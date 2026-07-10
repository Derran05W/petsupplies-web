import { type Metadata } from 'next';
import { Suspense } from 'react';
import { brand } from '@/lib/config/brand';
import { getProductBySlug } from '@/lib/api/products';
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
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · ${brand.name}`,
      description: product.description,
      images: product.images
        .filter((image) => image.url.length > 0)
        .map((image) => ({
          url: image.url,
          alt: image.alt || product.name,
        })),
    },
  };
}

export default function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { page: reviewsPage, sort: reviewsSort } =
    parseReviewListingParams(searchParams);

  const reviewsSuspenseKey = `reviews-${params.slug}-${reviewsPage}-${reviewsSort}`;
  const relatedSuspenseKey = `related-${params.slug}`;

  return (
    <>
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
