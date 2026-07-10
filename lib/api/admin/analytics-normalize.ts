import type {
  AdminAnalyticsDiscountRow,
  AdminAnalyticsDiscounts,
  AdminAnalyticsLowStock,
  AdminAnalyticsLowStockRow,
  AdminAnalyticsOverview,
  AdminAnalyticsRevenuePoint,
  AdminAnalyticsRevenueTimeseries,
  AdminAnalyticsSubscriptions,
  AdminAnalyticsTopProductRow,
  AdminAnalyticsTopProducts,
} from '@/types/admin-analytics';

/**
 * The store settles in one currency; the backend analytics endpoints omit a
 * currency field, so we default it here.
 * followup: backend should include the store currency in analytics responses.
 */
const DEFAULT_CURRENCY = 'cad';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function rowsFromEnvelope<T>(raw: unknown): T[] {
  const obj = asRecord(raw);
  if (!obj) return [];
  if (Array.isArray(obj.items)) return obj.items as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];
  return [];
}

/** Map petsupplies-api analytics JSON to web admin types. */
export function normalizeAdminAnalyticsOverview(
  raw: unknown,
): AdminAnalyticsOverview {
  const o = asRecord(raw) ?? {};
  const range = asRecord(o.range);
  let periodDays = 30;
  if (range?.from && range?.to) {
    const span =
      new Date(String(range.to)).getTime() -
      new Date(String(range.from)).getTime();
    periodDays = Math.max(1, Math.ceil(span / 86_400_000));
  } else if (typeof o.periodDays === 'number') {
    periodDays = o.periodDays;
  }

  return {
    revenueCents: Number(o.revenueCents ?? 0),
    // Wire uses `orderCount`; keep the alias in case it is ever renamed.
    ordersCount: Number(o.ordersCount ?? o.orderCount ?? 0),
    // Backend `OverviewResult` has no customer count — surface 0 until it does.
    customersCount: Number(o.customersCount ?? 0),
    aovCents: Number(o.aovCents ?? 0),
    currency: typeof o.currency === 'string' ? o.currency : DEFAULT_CURRENCY,
    periodDays,
  };
}

/**
 * `GET /admin/analytics/revenue-timeseries` returns
 * `{ granularity, points: [{ bucket, revenueCents, orderCount }] }` with no
 * currency. Map `bucket` → `date` and default the currency.
 */
export function normalizeAdminAnalyticsRevenueTimeseries(
  raw: unknown,
): AdminAnalyticsRevenueTimeseries {
  const o = asRecord(raw) ?? {};
  const rawPoints = Array.isArray(o.points) ? o.points : [];
  const points: AdminAnalyticsRevenuePoint[] = rawPoints.map((pt) => {
    const p = asRecord(pt) ?? {};
    return {
      date:
        typeof p.date === 'string'
          ? p.date
          : typeof p.bucket === 'string'
            ? p.bucket
            : '',
      revenueCents: Number(p.revenueCents ?? 0),
      orderCount: Number(p.orderCount ?? 0),
    };
  });
  return {
    currency: typeof o.currency === 'string' ? o.currency : DEFAULT_CURRENCY,
    points,
  };
}

export function normalizeAdminAnalyticsTopProducts(
  raw: unknown,
): AdminAnalyticsTopProducts {
  const rows = rowsFromEnvelope<Record<string, unknown>>(raw);
  const items: AdminAnalyticsTopProductRow[] = rows.map((r) => ({
    productId: String(r.productId ?? ''),
    slug: String(r.slug ?? ''),
    name: String(r.name ?? ''),
    imageUrl:
      typeof r.imageUrl === 'string'
        ? r.imageUrl
        : typeof r.primaryImageUrl === 'string'
          ? r.primaryImageUrl
          : undefined,
    unitsSold: Number(r.unitsSold ?? r.units ?? 0),
    revenueCents: Number(r.revenueCents ?? r.revenue ?? 0),
  }));
  return { items };
}

export function normalizeAdminAnalyticsLowStock(
  raw: unknown,
): AdminAnalyticsLowStock {
  const rows = rowsFromEnvelope<Record<string, unknown>>(raw);
  const items: AdminAnalyticsLowStockRow[] = rows.map((r) => ({
    id: String(r.id ?? ''),
    name: String(r.name ?? ''),
    slug: String(r.slug ?? ''),
    stockCount: Number(r.stockCount ?? r.stock ?? 0),
    primaryImageUrl:
      typeof r.primaryImageUrl === 'string'
        ? r.primaryImageUrl
        : typeof r.imageUrl === 'string'
          ? r.imageUrl
          : '',
  }));
  return { items };
}

export function normalizeAdminAnalyticsSubscriptions(
  raw: unknown,
): AdminAnalyticsSubscriptions {
  const o = asRecord(raw) ?? {};
  const byStatus = asRecord(o.byStatus);
  return {
    activeCount: Number(byStatus?.ACTIVE ?? o.activeCount ?? 0),
    pausedCount: Number(byStatus?.PAUSED ?? o.pausedCount ?? 0),
    cancelledCount: Number(byStatus?.CANCELLED ?? o.cancelledCount ?? 0),
    mrrCents: Number(o.mrrCents ?? 0),
    churnPercent:
      typeof o.churnPercent === 'number' ? o.churnPercent : undefined,
  };
}

export function normalizeAdminAnalyticsDiscounts(
  raw: unknown,
): AdminAnalyticsDiscounts {
  const rows = rowsFromEnvelope<Record<string, unknown>>(raw);
  const items: AdminAnalyticsDiscountRow[] = rows.map((r) => ({
    code: String(r.code ?? ''),
    uses: Number(r.uses ?? r.redemptionsInRange ?? r.usedCount ?? 0),
    revenueCents: Number(r.revenueCents ?? 0),
    discountCents: Number(r.discountCents ?? r.revenueImpactCents ?? 0),
  }));
  return { items };
}
