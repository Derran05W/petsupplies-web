'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AdminOrderSummary } from '@/types/admin';
import { cn } from '@/lib/utils';
import { NAV_LINK_CLASSES } from '@/components/ui';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { AdminFormSkeleton } from '@/components/admin/AdminLoadingSkeletons';
import { useAdminOrderQuery } from '@/hooks/useAdminOrders';
import { OrderStatusUpdateForm } from './OrderStatusUpdateForm';
import { OrderTrackingForm } from './OrderTrackingForm';

interface OrderDetailDrawerProps {
  /** The currently-selected order's id (`?selected=`), or null when
   * the drawer is closed. */
  selectedId: string | null;
  /** All orders on the current page. Used as the fallback row if the
   * per-order detail fetch fails; otherwise the drawer renders the freshly
   * fetched detail (which carries the `ship*` address the list rows omit). */
  orders: AdminOrderSummary[];
}

/**
 * Side-mounted drawer for the admin order detail. Mirrors
 * `<ConfirmDialog />`'s a11y contract verbatim:
 *   role="dialog", aria-modal="true", focus-trap on open,
 *   focus-return on close, ESC closes, scroll-lock toggles.
 *
 * The geometry is the only difference (right-aligned, full-height,
 * wider) — that's why we don't reuse `<ConfirmDialog />` directly.
 *
 * URL is the source of truth for open/closed: `?selected=<orderId>`.
 * The "View" link in the table sets it; the close button / backdrop /
 * ESC removes it via `router.replace`.
 *
 * The admin LIST rows carry no `ship*` columns, so on open we fetch
 * `GET /admin/orders/:id` (via `useAdminOrderQuery`) to fill the shipping
 * address, showing a skeleton while it loads and falling back to the list
 * row if the fetch fails.
 */
export function OrderDetailDrawer({
  selectedId,
  orders,
}: OrderDetailDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const detailQuery = useAdminOrderQuery(selectedId);

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('selected');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/admin/orders?${qs}` : '/admin/orders', {
      scroll: false,
    });
  };

  useEffect(() => {
    if (selectedId === null) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [selectedId]);

  useEffect(() => {
    if (selectedId === null) return;
    closeButtonRef.current?.focus();
  }, [selectedId]);

  useEffect(() => {
    if (selectedId === null) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (selectedId === null) return null;

  const listRow = orders.find((o) => o.id === selectedId) ?? null;
  // Detail wins; on error `data` is undefined and we fall back to the list row.
  const order = detailQuery.data ?? listRow;

  return (
    <div className="fixed inset-0 z-50">
      <div
        role="presentation"
        onClick={close}
        className="absolute inset-0 bg-scrim"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-drawer-title"
        className="absolute inset-x-0 bottom-0 max-h-[92svh] overflow-y-auto rounded-t-card border border-line bg-paper text-ink shadow-lifted sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-full sm:max-w-lg sm:rounded-l-card sm:rounded-tr-none"
      >
        <header className="bg-paper/95 sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="font-body text-micro uppercase text-ink-muted">
              Order
            </p>
            <h2
              id="admin-order-drawer-title"
              className="font-display text-2xl tracking-[-0.01em] text-ink"
            >
              #{selectedId.slice(-8)}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close order detail"
            className={cn(
              NAV_LINK_CLASSES,
              'shrink-0 font-body text-label uppercase text-ink',
            )}
          >
            Close
          </button>
        </header>

        <div className="flex flex-col gap-4 p-5">
          {detailQuery.isLoading ? (
            <AdminFormSkeleton />
          ) : order ? (
            <>
              <OrderSummaryCard order={order} />
              <OrderStatusUpdateForm order={order} />
              <OrderTrackingForm order={order} />
            </>
          ) : (
            <p role="alert" className="font-body text-sm text-danger-solid">
              Couldn&apos;t load this order. Close and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
