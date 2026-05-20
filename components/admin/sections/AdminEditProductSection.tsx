import { notFound } from 'next/navigation';
import { adminGetProduct } from '@/lib/api/admin/products';
import { getAdminApiOpts } from '@/lib/api/admin/server-opts';
import { PageHeader } from '@/components/account/PageHeader';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { AdminSectionError } from './AdminSectionError';

interface AdminEditProductSectionProps {
  productId: string;
}

export async function AdminEditProductSection({
  productId,
}: AdminEditProductSectionProps) {
  try {
    const opts = await getAdminApiOpts();
    const product = await adminGetProduct(productId, opts);

    if (!product) notFound();

    return (
      <>
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
  } catch (err) {
    return <AdminSectionError err={err} fallback="Failed to load product." />;
  }
}
