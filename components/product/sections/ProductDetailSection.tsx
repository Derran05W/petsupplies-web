import { notFound } from 'next/navigation';
import { getFreeShippingThresholdCents } from '@/lib/config/shipping';
import { getProductBySlug } from '@/lib/api/products';
import { ProductDetail } from '@/components/product/ProductDetail';

interface ProductDetailSectionProps {
  slug: string;
}

export async function ProductDetailSection({
  slug,
}: ProductDetailSectionProps) {
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const freeShippingThresholdCents = await getFreeShippingThresholdCents();

  return (
    <ProductDetail
      product={product}
      freeShippingThresholdCents={freeShippingThresholdCents}
    />
  );
}
