'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { AdminOrderSummary } from '@/types/admin';
import type { OrderStatus } from '@/types/order';
import { ApiError } from '@/lib/api/client';
import { useUpdateAdminOrderMutation } from '@/hooks/useAdminOrders';
import { cn } from '@/lib/utils';

interface OrderStatusUpdateFormProps {
  order: AdminOrderSummary;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'paid',
  'fulfilled',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  const dirty = status !== order.status;
  const wantsShippedWithoutTracking =
    status === 'shipped' && !order.trackingNumber;

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!dirty) return;
        setError(null);
        setSuccess(null);
        try {
          await mutation.mutateAsync({
            id: order.id,
            input: { status },
          });
          setSuccess(`Status updated to ${STATUS_LABEL[status]}.`);
        } catch (err) {
          setError(errorMessageFor(err));
        }
      }}
      className="flex flex-col gap-3 rounded-xl border border-warm-200 bg-surface-card p-4"
    >
      <h3 className="font-body text-sm font-medium text-warm-900">
        Order status
      </h3>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-700"
        >
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 font-body text-xs text-brand-700"
        >
          {success}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label
          htmlFor={`status-${order.id}`}
          className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600 sm:w-24"
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
          className="flex-1 rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      {wantsShippedWithoutTracking && dirty && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 font-body text-xs text-amber-800"
        >
          Marking shipped without a tracking number — customers will see a
          “tracking will appear once available” message until you add one below.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!dirty || mutation.isPending}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-60',
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
