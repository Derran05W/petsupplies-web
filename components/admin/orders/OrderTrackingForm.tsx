'use client';

import { useEffect, useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import type { AdminOrderSummary } from '@/types/admin';
import { ApiError } from '@/lib/api/client';
import { useUpdateOrderTrackingMutation } from '@/hooks/useAdminOrders';
import { cn } from '@/lib/utils';

interface OrderTrackingFormProps {
  order: AdminOrderSummary;
}

// Backend `adminUpdateTrackingSchema` requires BOTH `trackingNumber` and
// `carrier` (min 1); `trackingUrl` is app-only (no backend column).
const trackingFormSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .min(1, 'Tracking number is required')
    .max(64, 'Tracking number must be 64 characters or fewer')
    .regex(
      /^[A-Za-z0-9 \-]+$/,
      'Use letters, numbers, dashes, and spaces only',
    ),
  carrier: z
    .string()
    .trim()
    .min(1, 'Carrier is required')
    .max(64, 'Carrier must be 64 characters or fewer')
    .regex(
      /^[A-Za-z0-9 .\-]+$/,
      'Use letters, numbers, dashes, dots, and spaces only',
    ),
  trackingUrl: z
    .string()
    .trim()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
});

type TrackingFormInput = z.infer<typeof trackingFormSchema>;

const inputBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong updating tracking. Please try again.';

function errorMessageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return NETWORK_ERROR_MESSAGE;
    if (err.status === 401) return SESSION_ERROR_MESSAGE;
    return err.message || GENERIC_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

export function OrderTrackingForm({ order }: OrderTrackingFormProps) {
  const mutation = useUpdateOrderTrackingMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TrackingFormInput>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      trackingNumber: order.trackingNumber ?? '',
      carrier: order.carrier ?? '',
      trackingUrl: order.trackingUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      trackingNumber: order.trackingNumber ?? '',
      carrier: order.carrier ?? '',
      trackingUrl: order.trackingUrl ?? '',
    });
  }, [order.trackingNumber, order.carrier, order.trackingUrl, reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSuccess(null);
    const trackingNumber = values.trackingNumber.trim();
    const carrier = values.carrier.trim();
    const trackingUrl = (values.trackingUrl ?? '').trim();
    try {
      await mutation.mutateAsync({
        id: order.id,
        input: {
          trackingNumber,
          carrier,
          trackingUrl: trackingUrl.length > 0 ? trackingUrl : null,
        },
      });
      setSuccess('Tracking saved.');
    } catch (err) {
      setSubmitError(errorMessageFor(err));
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-3 rounded-card border border-line bg-paper p-4"
    >
      <h3 className="font-body text-label uppercase text-ink">Tracking</h3>

      {submitError && (
        <p
          role="alert"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-xs text-danger-solid"
        >
          {submitError}
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

      <div>
        <label
          htmlFor={`tracking-number-${order.id}`}
          className="mb-1.5 block font-body text-micro uppercase text-ink"
        >
          Tracking number
        </label>
        <input
          id={`tracking-number-${order.id}`}
          type="text"
          placeholder="TRK123456789US"
          {...register('trackingNumber')}
          {...fieldErrorProps(
            `tracking-number-${order.id}`,
            errors.trackingNumber,
          )}
          className={cn(inputBase, errors.trackingNumber && inputError)}
        />
        {errors.trackingNumber && (
          <p
            id={`tracking-number-${order.id}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.trackingNumber.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`tracking-carrier-${order.id}`}
          className="mb-1.5 block font-body text-micro uppercase text-ink"
        >
          Carrier
        </label>
        <input
          id={`tracking-carrier-${order.id}`}
          type="text"
          placeholder="UPS"
          {...register('carrier')}
          {...fieldErrorProps(`tracking-carrier-${order.id}`, errors.carrier)}
          className={cn(inputBase, errors.carrier && inputError)}
        />
        {errors.carrier && (
          <p
            id={`tracking-carrier-${order.id}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.carrier.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`tracking-url-${order.id}`}
          className="mb-1.5 block font-body text-micro uppercase text-ink"
        >
          Tracking URL{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
            (optional)
          </span>
        </label>
        <input
          id={`tracking-url-${order.id}`}
          type="url"
          placeholder="https://carrier.example.com/track/TRK123"
          {...register('trackingUrl')}
          {...fieldErrorProps(`tracking-url-${order.id}`, errors.trackingUrl)}
          className={cn(inputBase, errors.trackingUrl && inputError)}
        />
        {errors.trackingUrl && (
          <p
            id={`tracking-url-${order.id}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.trackingUrl.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {mutation.isPending && (
            <Loader2 size={14} aria-hidden className="animate-spin" />
          )}
          Save tracking
        </button>
      </div>
    </form>
  );
}
