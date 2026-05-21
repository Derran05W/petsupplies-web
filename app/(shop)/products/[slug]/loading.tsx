import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';
import { ReviewSkeleton } from '@/components/product/reviews/ReviewSkeleton';
import { RelatedProductsSkeleton } from '@/components/product/RelatedProductsSkeleton';

/**
 * Instant feedback while navigating to a product detail page.
 */
export default function ProductDetailLoading() {
  return (
    <>
      <ProductDetailSkeleton />
      <div className="px-6 pb-20 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <ReviewSkeleton />
          <RelatedProductsSkeleton />
        </div>
      </div>
    </>
  );
}
