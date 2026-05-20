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

interface AccountPageProps {
  searchParams: { page?: string; returnTo?: string };
}

function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/**
 * `/account` — order history list (Phase 7 home for the customer hub).
 * Orders load in a streaming child; see `AccountOrdersSection`.
 */
export default function AccountPage({ searchParams }: AccountPageProps) {
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
          basePath="/account"
          extraQuery={extraQuery}
        />
      </Suspense>
    </>
  );
}
