import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminDiscountsManager } from '@/components/admin/discounts/AdminDiscountsManager';

export const metadata: Metadata = {
  title: `Admin · Discounts · ${brand.name}`,
};

export default function AdminDiscountsPage() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Discounts"
        description="Create and manage promotion codes applied at cart and checkout."
      />
      <Suspense
        fallback={
          <p className="font-body text-sm text-warm-600" aria-busy="true">
            Loading discounts…
          </p>
        }
      >
        <AdminDiscountsManager />
      </Suspense>
    </>
  );
}
