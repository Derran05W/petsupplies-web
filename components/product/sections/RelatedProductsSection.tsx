import { getProductBySlug } from '@/lib/api/products';
import { RelatedProducts } from '@/components/product/RelatedProducts';

interface RelatedProductsSectionProps {
  slug: string;
}

/**
 * Resolves pet type from the product (deduped via `getProductBySlug` cache)
 * then streams the related-products row.
 */
export async function RelatedProductsSection({
  slug,
}: RelatedProductsSectionProps) {
  const product = await getProductBySlug(slug);
  if (!product) {
    return null;
  }

  return (
    <RelatedProducts petType={product.petType} excludeSlug={product.slug} />
  );
}
