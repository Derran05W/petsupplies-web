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

const trackingFormSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .max(64, 'Tracking number must be 64 characters or fewer')
    .regex(/^[A-Za-z0-9 \-]*$/, 'Use letters, numbers, dashes, and spaces only')
    .optional()
    .or(z.literal('')),
  trackingUrl: z
    .string()
    .trim()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
});

type TrackingFormInput = z.infer<typeof trackingFormSchema>;

const inputBase =
  'w-full rounded-lg border border-warm-300 bg-white px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400';
const inputError = 'border-red-400 focus:ring-red-400';

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
      trackingUrl: order.trackingUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      trackingNumber: order.trackingNumber ?? '',
      trackingUrl: order.trackingUrl ?? '',
    });
  }, [order.trackingNumber, order.trackingUrl, reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSuccess(null);
    const trackingNumber = (values.trackingNumber ?? '').trim();
    const trackingUrl = (values.trackingUrl ?? '').trim();
    try {
      await mutation.mutateAsync({
        id: order.id,
        input: {
          trackingNumber: trackingNumber.length > 0 ? trackingNumber : null,
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
      className="flex flex-col gap-3 rounded-xl border border-warm-200 bg-white p-4"
    >
      <h3 className="font-body text-sm font-medium text-warm-900">Tracking</h3>

      {submitError && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-xs text-red-700"
        >
          {submitError}
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

      <div>
        <label
          htmlFor={`tracking-number-${order.id}`}
          className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
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
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.trackingNumber.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor={`tracking-url-${order.id}`}
          className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
        >
          Tracking URL{' '}
          <span className="font-normal normal-case tracking-normal text-warm-400">
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
            className="mt-1 font-body text-xs text-red-600"
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
            'inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-60',
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
