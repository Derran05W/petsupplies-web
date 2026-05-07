import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { brand } from '@/lib/config/brand';
import { getProductBySlug } from '@/lib/api/products';
import { ProductDetail } from '@/components/product/ProductDetail';
import { RelatedProducts } from '@/components/product/RelatedProducts';

interface ProductDetailPageProps {
  params: { slug: string };
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

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetail product={product} />
      <div className="px-6 pb-20 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <RelatedProducts
            petType={product.petType}
            excludeSlug={product.slug}
          />
        </div>
      </div>
    </>
  );
}
