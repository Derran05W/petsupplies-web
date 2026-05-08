import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { adminGetProduct } from '@/lib/api/admin/products';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { ProductForm } from '@/components/admin/products/ProductForm';

interface EditPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: EditPageProps): Promise<Metadata> {
  const accessToken = await getServerAccessToken();
  const product = await adminGetProduct(
    params.id,
    accessToken ? { accessToken } : {},
  );
  return {
    title: product
      ? `Admin · ${product.name} · ${brand.name}`
      : `Admin · Edit product · ${brand.name}`,
  };
}

export default async function AdminEditProductPage({ params }: EditPageProps) {
  const accessToken = await getServerAccessToken();
  const product = await adminGetProduct(
    params.id,
    accessToken ? { accessToken } : {},
  );

  if (!product) notFound();

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading={product.name}
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: product.name },
        ]}
      />
      <ProductForm initialProduct={product} />
    </>
  );
}
