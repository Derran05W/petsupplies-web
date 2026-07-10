import { type PetType } from '@/types/product';
import { getRelatedProducts } from '@/lib/api/products';
import { ProductCard, SectionHeader } from '@/components/ui';
import { TILE_TONES } from '@/components/ui/tones';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

interface RelatedProductsProps {
  petType: PetType;
  excludeSlug: string;
}

/**
 * "You might also like" row at the bottom of the product detail page —
 * boutique product cards on the tonal tile cycle, with a wishlist heart
 * in each tile. Wrapped in `<Suspense>` by `RelatedProductsSection` on
 * the PDP.
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
      className="mt-16 border-t border-line pt-12"
    >
      <SectionHeader
        kicker="Keep browsing"
        headingId="related-heading"
        className="mb-8"
      >
        You might also like
      </SectionHeader>
      <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            tone={TILE_TONES[index % TILE_TONES.length]!}
            overlaySlot={<WishlistButton product={product} variant="overlay" />}
          />
        ))}
      </div>
    </section>
  );
}
