import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { ProductForm } from '@/components/admin/products/ProductForm';

export const metadata: Metadata = {
  title: `Admin · New product · ${brand.name}`,
};

export default function AdminNewProductPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="New product"
        breadcrumb={[
          { label: 'Admin', href: '/admin' },
          { label: 'Products', href: '/admin/products' },
          { label: 'New product' },
        ]}
      />
      <ProductForm initialProduct={null} />
    </>
  );
}
