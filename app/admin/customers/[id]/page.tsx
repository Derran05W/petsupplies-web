import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { AdminBanner } from '@/components/admin/AdminBanner';
import {
  AdminCustomerHeaderSkeleton,
  AdminTableSkeleton,
} from '@/components/admin/AdminLoadingSkeletons';
import { cn } from '@/lib/utils';
import {
  AdminCustomerHeaderSection,
  AdminCustomerTabSection,
  parseAdminCustomerPage,
} from '@/components/admin/sections/AdminCustomerDetailSections';

interface PageProps {
  params: { id: string };
  searchParams: { page?: string; tab?: string };
}

export const metadata: Metadata = {
  title: `Admin · Customer · ${brand.name}`,
};

export default function AdminCustomerDetailPage({
  params,
  searchParams,
}: PageProps) {
  const customerId = decodeURIComponent(params.id);
  const page = parseAdminCustomerPage(searchParams.page);
  const tab = searchParams.tab === 'subscriptions' ? 'subscriptions' : 'orders';
  const tabSuspenseKey = JSON.stringify({ customerId, tab, page });

  const tabClass = (active: boolean) =>
    cn(
      'rounded-pill border px-4 py-2 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
      active
        ? 'border-ink bg-ink text-paper'
        : 'border-line bg-transparent text-ink-secondary hover:border-ink',
    );

  const ordersLink = `/admin/customers/${encodeURIComponent(customerId)}`;
  const subsLink = `${ordersLink}?tab=subscriptions`;

  return (
    <>
      <AdminBanner />
      <Suspense fallback={<AdminCustomerHeaderSkeleton />}>
        <AdminCustomerHeaderSection customerId={customerId} />
      </Suspense>

      <nav
        aria-label="Customer sections"
        className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4"
      >
        <Link href={ordersLink} className={tabClass(tab === 'orders')}>
          Orders
        </Link>
        <Link href={subsLink} className={tabClass(tab === 'subscriptions')}>
          Subscriptions
        </Link>
      </nav>

      <div className="mt-6">
        <Suspense
          key={tabSuspenseKey}
          fallback={
            <AdminTableSkeleton
              caption={
                tab === 'orders' ? 'Customer orders' : 'Customer subscriptions'
              }
              columns={
                tab === 'orders'
                  ? ['Date', 'Status', 'Total', 'Admin']
                  : ['Plan', 'Status', 'Next delivery']
              }
              rows={5}
            />
          }
        >
          <AdminCustomerTabSection
            customerId={customerId}
            tab={tab}
            page={page}
          />
        </Suspense>
      </div>
    </>
  );
}
