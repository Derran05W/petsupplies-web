import type { OrderSummary } from '@/types/order';
import { Truck } from 'lucide-react';

interface OrderTrackingProps {
  order: OrderSummary;
}

/**
 * Carrier-agnostic tracking strip for the order detail page.
 *
 * Visibility rules:
 *   - `trackingNumber` present  → show the number + (optional) external link
 *   - `shipped` / `fulfilled` w/o tracking → show the "tracking will appear" microcopy
 *   - any earlier status (pending / paid) w/o tracking → render nothing
 *   - terminal states (delivered / cancelled / refunded) w/o tracking → render nothing
 */
export function OrderTracking({ order }: OrderTrackingProps) {
  const { trackingNumber, trackingUrl, status } = order;
  const isInTransitStatus = status === 'shipped' || status === 'fulfilled';

  if (!trackingNumber && !isInTransitStatus) return null;

  return (
    <section
      aria-label="Order tracking"
      className="mt-6 flex w-full max-w-2xl items-start gap-4 rounded-card border border-line bg-paper px-6 py-5 md:px-8"
    >
      <span
        aria-hidden
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-tile bg-tile-slate text-tile-slate-ink"
      >
        <Truck size={18} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 className="font-body text-micro uppercase text-ink-muted">
          Tracking
        </h2>
        {trackingNumber ? (
          <>
            <p className="break-all font-body text-sm font-medium text-ink">
              {trackingNumber}
            </p>
            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
              >
                Track this shipment
                <span aria-hidden> ↗</span>
              </a>
            )}
          </>
        ) : (
          <p className="font-body text-sm text-ink-secondary">
            Tracking will appear here once it&apos;s available.
          </p>
        )}
      </div>
    </section>
  );
}
