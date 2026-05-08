import type { Metadata } from 'next';
import { DollarSign, PackageX, ShoppingBag } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { getServerAccessToken } from '@/lib/supabase/access-token';
import { getDashboardStats } from '@/lib/api/admin/dashboard';
import { formatPrice } from '@/lib/utils/format';
import { PageHeader } from '@/components/account/PageHeader';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { LowStockList } from '@/components/admin/dashboard/LowStockList';

export const metadata: Metadata = {
  title: `Admin · ${brand.name}`,
};

function deltaPercent(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * `/admin` — dashboard hub. Pure server component: reads the access
 * token from the request-scoped Supabase client, fetches the stats
 * once, renders three cards + the low-stock list. No real-time
 * refresh — see Phase 8 per-phase notes for the rejection.
 */
export default async function AdminDashboardPage() {
  const accessToken = await getServerAccessToken();
  const stats = await getDashboardStats(accessToken ? { accessToken } : {});

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Dashboard"
        description="The week at a glance, with low-stock alerts."
      />

      <section
        aria-label="Weekly stats"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <StatCard
          label="Orders this week"
          value={String(stats.ordersThisWeek)}
          icon={ShoppingBag}
          deltaPercent={deltaPercent(
            stats.ordersThisWeek,
            stats.ordersLastWeek,
          )}
        />
        <StatCard
          label="Revenue this week"
          value={formatPrice(stats.revenueCentsThisWeek, stats.currency)}
          icon={DollarSign}
          deltaPercent={deltaPercent(
            stats.revenueCentsThisWeek,
            stats.revenueCentsLastWeek,
          )}
        />
        <StatCard
          label="Low-stock alerts"
          value={String(stats.lowStockCount)}
          icon={PackageX}
          deltaPercent={null}
          href="/admin/products?stock=low"
        />
      </section>

      <div className="mt-8">
        <LowStockList products={stats.lowStockProducts} />
      </div>
    </>
  );
}
