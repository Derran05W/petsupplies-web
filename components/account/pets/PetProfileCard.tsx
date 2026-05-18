'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Pet } from '@/types/pet';
import {
  petProfileFormValuesToPetInput,
  type PetInput,
  type PetProfileFormValues,
} from '@/lib/account/schemas';
import { PetProfileForm } from './PetProfileForm';

const SPECIES_LABEL: Record<Pet['species'], string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  small_animal: 'Small animal',
};

export function petToFormValues(pet: Pet): PetProfileFormValues {
  const weightInput =
    pet.weightGrams !== undefined
      ? (pet.weightGrams / 1000).toFixed(pet.weightGrams % 1000 === 0 ? 0 : 1)
      : '';

  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    birthDate: pet.birthDate ?? '',
    dietaryNotes: pet.dietaryNotes ?? '',
    profilePhotoUrl: pet.profilePhotoUrl ?? '',
    weightInput,
    weightUnit: 'kg',
  };
}

function formatBirthDate(isoDay: string | undefined): string | null {
  if (!isoDay) return null;
  const d = isoDay.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(`${d}T12:00:00.000Z`));
  } catch {
    return d;
  }
}

function formatWeightKg(grams?: number): string | null {
  if (grams === undefined) return null;
  const kg = grams / 1000;
  const text = Number.isInteger(kg)
    ? kg.toString()
    : kg.toFixed(1).replace(/\.0$/, '');
  return `${text} kg`;
}

interface PetProfileCardProps {
  pet: Pet;
  onSave: (input: PetInput) => Promise<string | null>;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function PetProfileCard({
  pet,
  onSave,
  onDelete,
  disabled = false,
}: PetProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [savingEdit, setSavingEdit] = useState(false);

  if (editing) {
    return (
      <PetProfileForm
        initial={petToFormValues(pet)}
        submitLabel="Save changes"
        submitError={submitError}
        busy={savingEdit}
        onCancel={() => {
          setEditing(false);
          setSubmitError(undefined);
        }}
        onSubmit={async (values) => {
          setSubmitError(undefined);
          setSavingEdit(true);
          try {
            const input = petProfileFormValuesToPetInput(values);
            const err = await onSave(input);
            if (err) {
              setSubmitError(err);
              return;
            }
            setEditing(false);
          } finally {
            setSavingEdit(false);
          }
        }}
      />
    );
  }

  const birth = formatBirthDate(pet.birthDate);
  const weight = formatWeightKg(pet.weightGrams);

  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border border-warm-200 bg-white p-5">
      <header className="flex items-start gap-3">
        {pet.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pet.profilePhotoUrl}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 font-body text-lg font-medium text-brand-700"
          >
            {pet.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-medium text-warm-900">
            {pet.name}
          </p>
          <p className="font-body text-xs text-warm-600">
            {SPECIES_LABEL[pet.species]}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </p>
        </div>
      </header>

      <dl className="grid gap-2 font-body text-sm text-warm-600">
        {birth && (
          <div className="flex justify-between gap-2">
            <dt className="text-warm-500">Birthday</dt>
            <dd className="text-right text-warm-900">{birth}</dd>
          </div>
        )}
        {weight && (
          <div className="flex justify-between gap-2">
            <dt className="text-warm-500">Weight</dt>
            <dd className="text-right text-warm-900">{weight}</dd>
          </div>
        )}
        {pet.dietaryNotes && (
          <div className="flex flex-col gap-0.5 border-t border-warm-100 pt-2">
            <dt className="text-warm-500">Diet</dt>
            <dd className="text-warm-900">{pet.dietaryNotes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-warm-200 pt-4">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-warm-300 bg-transparent px-3 py-1.5 font-body text-xs text-warm-900 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Pencil size={12} aria-hidden />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(pet.id)}
          disabled={disabled}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-xs text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={12} aria-hidden />
          Delete
        </button>
      </div>
    </article>
  );
}
