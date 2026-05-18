'use client';

import { useId } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  PET_SPECIES,
  petProfileFormSchema,
  type PetProfileFormValues,
} from '@/lib/account/schemas';
import { cn } from '@/lib/utils';

const inputBase =
  'w-full rounded-lg border border-warm-300 bg-white px-3 py-2.5 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400';
const inputError = 'border-red-400 focus:ring-red-400';
const labelBase =
  'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600';

const SPECIES_LABEL: Record<(typeof PET_SPECIES)[number], string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  small_animal: 'Small animal',
};

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

interface PetProfileFormProps {
  initial?: PetProfileFormValues;
  submitLabel?: string;
  onSubmit: (values: PetProfileFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitError?: string;
  busy?: boolean;
}

const DEFAULT_VALUES: PetProfileFormValues = {
  name: '',
  species: '',
  breed: '',
  birthDate: '',
  dietaryNotes: '',
  profilePhotoUrl: '',
  weightInput: '',
  weightUnit: 'kg',
};

export function PetProfileForm({
  initial,
  submitLabel = 'Save pet',
  onSubmit,
  onCancel,
  submitError,
  busy = false,
}: PetProfileFormProps) {
  const idPrefix = useId();
  const fieldId = (name: string) => `${idPrefix}-${name}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetProfileFormValues>({
    resolver: zodResolver(petProfileFormSchema),
    defaultValues: initial ?? DEFAULT_VALUES,
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5 md:p-6"
    >
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-body text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor={fieldId('name')} className={labelBase}>
          Name
        </label>
        <input
          id={fieldId('name')}
          type="text"
          autoComplete="off"
          placeholder="Luna"
          {...register('name')}
          {...fieldErrorProps(fieldId('name'), errors.name)}
          className={cn(inputBase, errors.name && inputError)}
        />
        {errors.name && (
          <p
            id={`${fieldId('name')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('species')} className={labelBase}>
          Species
        </label>
        <select
          id={fieldId('species')}
          {...register('species')}
          {...fieldErrorProps(fieldId('species'), errors.species)}
          className={cn(inputBase, errors.species && inputError)}
        >
          <option value="">Select species</option>
          {PET_SPECIES.map((s) => (
            <option key={s} value={s}>
              {SPECIES_LABEL[s]}
            </option>
          ))}
        </select>
        {errors.species && (
          <p
            id={`${fieldId('species')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.species.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('breed')} className={labelBase}>
          Breed{' '}
          <span className="font-normal normal-case tracking-normal text-warm-400">
            (optional)
          </span>
        </label>
        <input
          id={fieldId('breed')}
          type="text"
          autoComplete="off"
          {...register('breed')}
          {...fieldErrorProps(fieldId('breed'), errors.breed)}
          className={cn(inputBase, errors.breed && inputError)}
        />
        {errors.breed && (
          <p
            id={`${fieldId('breed')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.breed.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('birthDate')} className={labelBase}>
          Birthday{' '}
          <span className="font-normal normal-case tracking-normal text-warm-400">
            (optional)
          </span>
        </label>
        <input
          id={fieldId('birthDate')}
          type="date"
          {...register('birthDate')}
          {...fieldErrorProps(fieldId('birthDate'), errors.birthDate)}
          className={cn(inputBase, errors.birthDate && inputError)}
        />
        {errors.birthDate && (
          <p
            id={`${fieldId('birthDate')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.birthDate.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('weightInput')} className={labelBase}>
            Weight{' '}
            <span className="font-normal normal-case tracking-normal text-warm-400">
              (optional)
            </span>
          </label>
          <input
            id={fieldId('weightInput')}
            type="text"
            inputMode="decimal"
            placeholder="4.5"
            {...register('weightInput')}
            {...fieldErrorProps(fieldId('weightInput'), errors.weightInput)}
            className={cn(inputBase, errors.weightInput && inputError)}
          />
          {errors.weightInput && (
            <p
              id={`${fieldId('weightInput')}-error`}
              role="alert"
              className="mt-1 font-body text-xs text-red-600"
            >
              {errors.weightInput.message}
            </p>
          )}
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className={labelBase}>Unit</legend>
          <div className="flex flex-wrap gap-4 font-body text-sm text-warm-900">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="kg"
                {...register('weightUnit')}
                className="size-4 border-warm-300 text-brand-400 focus:ring-brand-400"
              />
              kg
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="lb"
                {...register('weightUnit')}
                className="size-4 border-warm-300 text-brand-400 focus:ring-brand-400"
              />
              lb
            </label>
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor={fieldId('dietaryNotes')} className={labelBase}>
          Dietary notes{' '}
          <span className="font-normal normal-case tracking-normal text-warm-400">
            (optional)
          </span>
        </label>
        <textarea
          id={fieldId('dietaryNotes')}
          rows={3}
          {...register('dietaryNotes')}
          {...fieldErrorProps(fieldId('dietaryNotes'), errors.dietaryNotes)}
          className={cn(
            inputBase,
            'resize-y',
            errors.dietaryNotes && inputError,
          )}
        />
        {errors.dietaryNotes && (
          <p
            id={`${fieldId('dietaryNotes')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.dietaryNotes.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('profilePhotoUrl')} className={labelBase}>
          Photo URL{' '}
          <span className="font-normal normal-case tracking-normal text-warm-400">
            (optional)
          </span>
        </label>
        <input
          id={fieldId('profilePhotoUrl')}
          type="url"
          inputMode="url"
          placeholder="https://…"
          {...register('profilePhotoUrl')}
          {...fieldErrorProps(
            fieldId('profilePhotoUrl'),
            errors.profilePhotoUrl,
          )}
          className={cn(inputBase, errors.profilePhotoUrl && inputError)}
        />
        {errors.profilePhotoUrl && (
          <p
            id={`${fieldId('profilePhotoUrl')}-error`}
            role="alert"
            className="mt-1 font-body text-xs text-red-600"
          >
            {errors.profilePhotoUrl.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 size={14} aria-hidden className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
