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
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

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
            className="mt-1 font-body text-xs text-danger-solid"
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
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.species.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('breed')} className={labelBase}>
          Breed{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
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
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.breed.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('birthDate')} className={labelBase}>
          Birthday{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
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
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.birthDate.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('weightInput')} className={labelBase}>
            Weight{' '}
            <span className="font-normal normal-case tracking-normal text-ink-faint">
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
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.weightInput.message}
            </p>
          )}
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className={labelBase}>Unit</legend>
          <div className="flex flex-wrap gap-4 font-body text-sm text-ink">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="kg"
                {...register('weightUnit')}
                className="size-4 border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              />
              kg
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="lb"
                {...register('weightUnit')}
                className="size-4 border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              />
              lb
            </label>
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor={fieldId('dietaryNotes')} className={labelBase}>
          Dietary notes{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
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
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.dietaryNotes.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={fieldId('profilePhotoUrl')} className={labelBase}>
          Photo URL{' '}
          <span className="font-normal normal-case tracking-normal text-ink-faint">
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
            className="mt-1 font-body text-xs text-danger-solid"
          >
            {errors.profilePhotoUrl.message}
          </p>
        )}
      </div>

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
