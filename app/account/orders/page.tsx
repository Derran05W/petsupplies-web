import type { Metadata } from 'next';
import { Suspense } from 'react';
import { brand } from '@/lib/config/brand';
import { safeReturnPath } from '@/lib/navigation/safe-return-path';
import { PageHeader } from '@/components/account/PageHeader';
import { AccountOrdersLoading } from '@/components/account/AccountOrdersLoading';
import { AccountOrdersSection } from '@/components/account/sections/AccountOrdersSection';

export const metadata: Metadata = {
  title: `Your orders · ${brand.name}`,
};

interface OrdersPageProps {
  searchParams: { page?: string; returnTo?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/**
 * `/account/orders` — alias for `/account` so deep links from emails
 * land somewhere sensible. Same streaming orders section as `/account`.
 */
export default function OrdersAliasPage({ searchParams }: OrdersPageProps) {
  const page = parsePage(searchParams.page);
  const safeReturn = safeReturnPath(searchParams.returnTo);
  const extraQuery = safeReturn ? { returnTo: safeReturn } : undefined;

  return (
    <>
      <PageHeader
        heading="Your orders"
        description="Everything you've ordered, with status and tracking when available."
      />
      <Suspense key={page} fallback={<AccountOrdersLoading />}>
        <AccountOrdersSection
          page={page}
          basePath="/account/orders"
          extraQuery={extraQuery}
        />
      </Suspense>
    </>
  );
}
