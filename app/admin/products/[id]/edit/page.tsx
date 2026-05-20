import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminFormSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import { AdminEditProductSection } from '@/components/admin/sections/AdminEditProductSection';

interface EditPageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: `Admin · Edit product · ${brand.name}`,
};

export default function AdminEditProductPage({ params }: EditPageProps) {
  return (
    <>
      <AdminBanner />
      <Suspense fallback={<AdminFormSkeleton />}>
        <AdminEditProductSection productId={params.id} />
      </Suspense>
    </>
  );
}
