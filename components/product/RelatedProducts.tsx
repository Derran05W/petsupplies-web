import { type PetType } from '@/types/product';
import { getRelatedProducts } from '@/lib/api/products';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  petType: PetType;
  excludeSlug: string;
}

/**
 * "You might also like" row at the bottom of the product detail page.
 * Wrapped in `<Suspense>` by `RelatedProductsSection` on the PDP.
 *
 * Rendering nothing when there are no related products is intentional —
 * a row with one item or zero looks worse than no row at all.
 */
export async function RelatedProducts({
  petType,
  excludeSlug,
}: RelatedProductsProps) {
  const related = await getRelatedProducts(petType, excludeSlug);
  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="mt-16 border-t border-warm-200 pt-12"
    >
      <h2
        id="related-heading"
        className="mb-8 font-display text-3xl tracking-[-0.02em] text-warm-900"
      >
        You might also like
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
