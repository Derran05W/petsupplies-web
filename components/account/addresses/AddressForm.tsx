'use client';

import { useId } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { addressInputSchema, type AddressInput } from '@/lib/account/schemas';
import { cn } from '@/lib/utils';

/** Backend `/users/me/addresses` persists Canadian addresses only. */
const SUPPORTED_COUNTRIES = [{ code: 'CA', label: 'Canada' }] as const;

const inputBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

interface AddressFormProps {
  /** When provided, the form pre-fills for editing. */
  initial?: AddressInput;
  /** "Save", "Add address", etc. */
  submitLabel?: string;
  /** Called with the validated form values. */
  onSubmit: (values: AddressInput) => Promise<void> | void;
  onCancel: () => void;
  /** Top-of-form error summary text (e.g. from a failed network mutation). */
  submitError?: string;
  /** When true, disables the submit button and shows a spinner. */
  busy?: boolean;
  /** Always render the "Set as default" toggle. Defaults to true. */
  showDefaultToggle?: boolean;
}

/**
 * Shared form chrome for both "Add" and "Edit" address flows. Uses the
 * boutique input chrome (`border-line`, ink focus border,
 * `aria-invalid` + `aria-describedby` per WAI-ARIA Authoring Practices).
 *
 * Field IDs are namespaced via `useId()` so multiple `<AddressForm />`s
 * can render on the same page without colliding (Edit flow opens
 * inside a card while the top-level Add panel is also visible).
 */
export function AddressForm({
  initial,
  submitLabel = 'Save address',
  onSubmit,
  onCancel,
  submitError,
  busy = false,
  showDefaultToggle = true,
}: AddressFormProps) {
  const idPrefix = useId();
  const fieldId = (name: string) => `${idPrefix}-${name}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      fullName: initial?.fullName ?? '',
      line1: initial?.line1 ?? '',
      line2: initial?.line2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      postalCode: initial?.postalCode ?? '',
      country: initial?.country ?? 'CA',
      isDefault: initial?.isDefault ?? false,
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 md:p-6"
    >
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid"
        >
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor={fieldId('fullName')} className={labelBase}>
          Full name
        </label>
        <input
          id={fieldId('fullName')}
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          {...register('fullName')}
          {...fieldErrorProps(fieldId('fullName'), errors.fullName)}
          className={cn(inputBase, errors.fullName && inputError)}
        />
        {errors.fullName && (
          <p
            id={`${fieldId('fullName')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('line1')} className={labelBase}>
          Address line 1
        </label>
        <input
          id={fieldId('line1')}
          type="text"
          autoComplete="address-line1"
          placeholder="123 Maple Street"
          {...register('line1')}
          {...fieldErrorProps(fieldId('line1'), errors.line1)}
          className={cn(inputBase, errors.line1 && inputError)}
        />
        {errors.line1 && (
          <p
            id={`${fieldId('line1')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.line1.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('line2')} className={labelBase}>
          Address line 2{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
            (optional)
          </span>
        </label>
        <input
          id={fieldId('line2')}
          type="text"
          autoComplete="address-line2"
          placeholder="Apt, suite, unit"
          {...register('line2')}
          {...fieldErrorProps(fieldId('line2'), errors.line2)}
          className={cn(inputBase, errors.line2 && inputError)}
        />
        {errors.line2 && (
          <p
            id={`${fieldId('line2')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.line2.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('city')} className={labelBase}>
            City
          </label>
          <input
            id={fieldId('city')}
            type="text"
            autoComplete="address-level2"
            placeholder="Brooklyn"
            {...register('city')}
            {...fieldErrorProps(fieldId('city'), errors.city)}
            className={cn(inputBase, errors.city && inputError)}
          />
          {errors.city && (
            <p
              id={`${fieldId('city')}-error`}
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.city.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={fieldId('state')} className={labelBase}>
            State / region
          </label>
          <input
            id={fieldId('state')}
            type="text"
            autoComplete="address-level1"
            placeholder="NY"
            {...register('state')}
            {...fieldErrorProps(fieldId('state'), errors.state)}
            className={cn(inputBase, errors.state && inputError)}
          />
          {errors.state && (
            <p
              id={`${fieldId('state')}-error`}
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('postalCode')} className={labelBase}>
            Postal code
          </label>
          <input
            id={fieldId('postalCode')}
            type="text"
            autoComplete="postal-code"
            placeholder="11201"
            {...register('postalCode')}
            {...fieldErrorProps(fieldId('postalCode'), errors.postalCode)}
            className={cn(inputBase, errors.postalCode && inputError)}
          />
          {errors.postalCode && (
            <p
              id={`${fieldId('postalCode')}-error`}
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={fieldId('country')} className={labelBase}>
            Country
          </label>
          <select
            id={fieldId('country')}
            autoComplete="country"
            {...register('country')}
            {...fieldErrorProps(fieldId('country'), errors.country)}
            className={cn(inputBase, errors.country && inputError)}
          >
            {SUPPORTED_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </select>
          {errors.country && (
            <p
              id={`${fieldId('country')}-error`}
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {showDefaultToggle && (
        <label className="flex items-center gap-2 font-body text-sm text-ink">
          <input
            type="checkbox"
            {...register('isDefault')}
            className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          />
          Use this as my default address
        </label>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex cursor-pointer items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 size={14} aria-hidden className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
