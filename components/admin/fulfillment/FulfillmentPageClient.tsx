'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import type { AdminOrderSummary } from '@/types/admin';
import { ApiError } from '@/lib/api/client';
import { PageHeader } from '@/components/account/PageHeader';
import { OrdersPagination } from '@/components/account/orders/OrdersPagination';
import { OrderStatusPill } from '@/components/account/orders/OrderStatusPill';
import { AdminBanner } from '@/components/admin/AdminBanner';
import { AdminTableSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { formatPrice } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import {
  mergeUpdatedOrdersIntoCaches,
  useAdminBulkShipMutation,
  useAdminFulfillmentQueueQuery,
} from '@/hooks/useAdminFulfillment';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_FILTER: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
];

function parsePage(raw: string | null): number {
  if (!raw) return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function FulfillmentInner() {
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const statusRaw = searchParams.get('status');
  const status =
    statusRaw === 'paid' || statusRaw === 'fulfilled' ? statusRaw : undefined;

  const queryClient = useQueryClient();
  const { data, isPending, isError, error, refetch } =
    useAdminFulfillmentQueueQuery({
      page,
      ...(status ? { status } : {}),
    });

  const bulkShip = useAdminBulkShipMutation();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastFailed, setLastFailed] = useState<
    { orderId: string; message: string }[] | null
  >(null);

  const orders = useMemo(() => data?.orders ?? [], [data?.orders]);
  const allSelected =
    orders.length > 0 && orders.every((o) => selected.has(o.id));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (orders.length === 0) return prev;
      if (orders.every((o) => prev.has(o.id))) return new Set();
      return new Set(orders.map((o) => o.id));
    });
  }, [orders]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const basePath = '/admin/fulfillment';
  const extraQuery = status ? { status } : undefined;

  const filterHref = (s: OrderStatus | '') => {
    const params = new URLSearchParams();
    if (s) params.set('status', s);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const onBulkConfirm = async () => {
    setSubmitError(null);
    const ids = [...selected];
    const tn = trackingNumber.trim();
    const ca = carrier.trim();
    // Backend requires both per item; the dialog's confirm is disabled until
    // they're set, so this guard is defensive.
    if (ids.length === 0 || !tn || !ca) return;
    try {
      const res = await bulkShip.mutateAsync({
        orderIds: ids,
        trackingNumber: tn,
        carrier: ca,
        ...(trackingUrl.trim() ? { trackingUrl: trackingUrl.trim() } : {}),
      });
      mergeUpdatedOrdersIntoCaches(queryClient, res.updated);
      setLastFailed(res.failed.length > 0 ? res.failed : null);
      setSelected(new Set());
      setDialogOpen(false);
      setTrackingNumber('');
      setTrackingUrl('');
      setCarrier('');
      void refetch();
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Bulk ship failed.');
    }
  };

  const busy = bulkShip.isPending;

  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Fulfillment"
        description="Queue of orders ready to ship. Select rows and add tracking in bulk."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTER.map((f) => (
          <Link
            key={f.label}
            href={filterHref(f.value)}
            className={cn(
              'rounded-pill border px-3 py-1.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
              (f.value || '') === (status ?? '')
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-transparent text-ink-secondary hover:border-ink',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={selected.size === 0 || busy}
          onClick={() => {
            setSubmitError(null);
            setDialogOpen(true);
          }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" aria-hidden />}
          Mark selected shipped ({selected.size})
        </button>
        {lastFailed && lastFailed.length > 0 && (
          <p role="status" className="font-body text-xs text-amber">
            {lastFailed.length} order(s) could not be updated. See API message
            per row in console-free UI below.
          </p>
        )}
      </div>

      {lastFailed && lastFailed.length > 0 && (
        <ul
          className="border-amber/40 mb-4 rounded-tile border bg-tile-amber px-4 py-3 font-body text-xs text-tile-amber-ink"
          aria-label="Bulk ship failures"
        >
          {lastFailed.map((f) => (
            <li key={f.orderId}>
              <span className="font-mono">{f.orderId}</span>: {f.message}
            </li>
          ))}
        </ul>
      )}

      {isPending && (
        <AdminTableSkeleton
          caption="Fulfillment queue"
          columns={['', 'Order', 'Customer', 'Status', 'Total', 'Actions']}
        />
      )}
      {isError && (
        <p role="alert" className="font-body text-sm text-danger-solid">
          {error instanceof Error ? error.message : 'Failed to load queue.'}
        </p>
      )}
      {!isPending && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-paper px-6 py-12 text-center">
          <Package className="text-ink-faint" size={36} aria-hidden />
          <p className="font-body text-sm text-ink-secondary">
            No orders in this queue.
          </p>
        </div>
      )}
      {!isPending && !isError && orders.length > 0 && (
        <>
          <div className="overflow-hidden rounded-card border border-line bg-paper">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] font-body text-sm">
                <thead className="border-b border-line">
                  <tr className="text-left font-body text-micro uppercase text-ink-muted">
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all on this page"
                        className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                      />
                    </th>
                    <th className="px-3 py-3 font-medium">Order</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">Total</th>
                    <th className="px-3 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((order: AdminOrderSummary) => (
                    <tr
                      key={order.id}
                      className="transition-colors duration-fast hover:bg-panel"
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(order.id)}
                          onChange={() => toggleOne(order.id)}
                          aria-label={`Select order ${order.id}`}
                          className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs text-ink-faint">
                          {order.id.slice(0, 12)}…
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="line-clamp-2 text-ink-secondary">
                          {order.customerName ?? order.customerEmail ?? '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <OrderStatusPill status={order.status} />
                      </td>
                      <td className="px-3 py-3 text-right font-display tabular-nums text-ink">
                        {formatPrice(order.totalCents, order.currency)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          href={`/admin/orders?selected=${encodeURIComponent(order.id)}`}
                          className="font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {data && data.totalPages > 1 && (
            <OrdersPagination
              currentPage={data.page}
              totalPages={data.totalPages}
              basePath={basePath}
              extraQuery={extraQuery}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={dialogOpen}
        title="Mark orders shipped"
        description={`Add tracking for ${selected.size} selected order(s). Customers may receive shipment notifications from the backend.`}
        confirmLabel={busy ? 'Working…' : 'Confirm ship'}
        cancelLabel="Cancel"
        busy={busy}
        confirmDisabled={!trackingNumber.trim() || !carrier.trim()}
        onClose={() => !busy && setDialogOpen(false)}
        onConfirm={onBulkConfirm}
      >
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
          <div>
            <label
              htmlFor="bulk-tracking"
              className="mb-1 block font-body text-micro uppercase text-ink"
            >
              Tracking number
            </label>
            <input
              id="bulk-tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              required
              className="w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              placeholder="1Z999AA10123456784"
            />
          </div>
          <div>
            <label
              htmlFor="bulk-url"
              className="mb-1 block font-body text-micro uppercase text-ink"
            >
              Tracking URL
            </label>
            <input
              id="bulk-url"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              className="w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              placeholder="https://…"
            />
          </div>
          <div>
            <label
              htmlFor="bulk-carrier"
              className="mb-1 block font-body text-micro uppercase text-ink"
            >
              Carrier
            </label>
            <input
              id="bulk-carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              required
              className="w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              placeholder="UPS"
            />
          </div>
          {submitError && (
            <p role="alert" className="font-body text-xs text-danger-solid">
              {submitError}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
}

function FulfillmentPageFallback() {
  return (
    <>
      <AdminBanner />
      <PageHeader
        heading="Fulfillment"
        description="Queue of orders ready to ship. Select rows and add tracking in bulk."
      />
      <AdminTableSkeleton
        caption="Fulfillment queue"
        columns={['', 'Order', 'Customer', 'Status', 'Total', 'Actions']}
      />
    </>
  );
}

export function FulfillmentPageClient() {
  return (
    <Suspense fallback={<FulfillmentPageFallback />}>
      <FulfillmentInner />
    </Suspense>
  );
}
