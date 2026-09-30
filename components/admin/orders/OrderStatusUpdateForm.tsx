'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { AdminOrderSummary, AdminOrderUpdateInput } from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { ApiError } from '@/lib/api/client';
import { useUpdateAdminOrderMutation } from '@/hooks/useAdminOrders';
import {
  settingsInputBase,
  settingsLabelBase,
} from '@/components/admin/settings/admin-settings-form-styles';
import { cn } from '@/lib/utils';

interface OrderStatusUpdateFormProps {
  order: AdminOrderSummary;
}

/**
 * The backend `updateStatusSchema` enum only accepts these three transitions;
 * `pending`/`paid`/`delivered`/`refunded` are not writable via this endpoint.
 */
const UPDATABLE_STATUSES: OrderStatus[] = ['shipped', 'fulfilled', 'cancelled'];

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  fulfilled: 'Fulfilled',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong updating that order. Please try again.';

function errorMessageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return NETWORK_ERROR_MESSAGE;
    if (err.status === 401) return SESSION_ERROR_MESSAGE;
    return err.message || GENERIC_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}

export function OrderStatusUpdateForm({ order }: OrderStatusUpdateFormProps) {
  const mutation = useUpdateAdminOrderMutation();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber ?? '',
  );
  const [carrier, setCarrier] = useState(order.carrier ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber ?? '');
    setCarrier(order.carrier ?? '');
  }, [order.status, order.trackingNumber, order.carrier]);

  const currentIsUpdatable = UPDATABLE_STATUSES.includes(order.status);
  const dirty = status !== order.status;
  // Backend superRefine: SHIPPED requires BOTH tracking number and carrier.
  const shippingNeedsTracking =
    status === 'shipped' &&
    (trackingNumber.trim().length === 0 || carrier.trim().length === 0);
  const canSubmit = dirty && !shippingNeedsTracking;

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!canSubmit) return;
        setError(null);
        setSuccess(null);
        try {
          const input: AdminOrderUpdateInput =
            status === 'shipped'
              ? {
                  status,
                  trackingNumber: trackingNumber.trim(),
                  carrier: carrier.trim(),
                }
              : { status };
          await mutation.mutateAsync({ id: order.id, input });
          setSuccess(`Status updated to ${STATUS_LABEL[status]}.`);
        } catch (err) {
          setError(errorMessageFor(err));
        }
      }}
      className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4"
    >
      <h3 className="font-body text-label uppercase text-ink">Order status</h3>

      {error && (
        <p
          role="alert"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-xs text-danger-solid"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          aria-live="polite"
          className="border-pine/40 rounded-tile border bg-tile-sage px-3 py-2 font-body text-xs text-tile-sage-ink"
        >
          {success}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          htmlFor={`status-${order.id}`}
          className="font-body text-micro uppercase text-ink sm:w-24"
        >
          Status
        </label>
        <select
          id={`status-${order.id}`}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as OrderStatus);
            setSuccess(null);
            setError(null);
          }}
          className="flex-1 rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink focus:border-ink focus:outline-none"
        >
          {!currentIsUpdatable && (
            <option value={order.status} disabled>
              {STATUS_LABEL[order.status]} (current)
            </option>
          )}
          {UPDATABLE_STATUSES.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      {status === 'shipped' && (
        <div className="flex flex-col gap-3 rounded-tile border border-line bg-panel p-3">
          <div>
            <label
              htmlFor={`ship-tracking-${order.id}`}
              className={settingsLabelBase}
            >
              Tracking number
            </label>
            <input
              id={`ship-tracking-${order.id}`}
              type="text"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="1Z999AA10123456784"
              required
              className={settingsInputBase}
            />
          </div>
          <div>
            <label
              htmlFor={`ship-carrier-${order.id}`}
              className={settingsLabelBase}
            >
              Carrier
            </label>
            <input
              id={`ship-carrier-${order.id}`}
              type="text"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              placeholder="UPS"
              required
              className={settingsInputBase}
            />
          </div>
          <p className="font-body text-xs text-ink-secondary">
            Marking shipped emails the customer their tracking details, so both
            fields are required.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit || mutation.isPending}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {mutation.isPending && (
            <Loader2 size={14} aria-hidden className="animate-spin" />
          )}
          Save status
        </button>
      </div>
    </form>
  );
}
