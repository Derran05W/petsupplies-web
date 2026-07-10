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
      <div className="bg-paper px-gutter pb-24 text-ink">
        <div className="mx-auto max-w-wrap">
          <ReviewSkeleton />
          <RelatedProductsSkeleton />
        </div>
      </div>
    </>
  );
}
