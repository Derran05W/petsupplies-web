'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  PetIcon,
  TONE_CLASSES,
  type PetIconName,
  type TileTone,
} from '@/components/ui';
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

/** Line-art glyph + gradient tile tone per species ('paw' where no dedicated icon exists). */
const SPECIES_ICON: Record<Pet['species'], PetIconName> = {
  dog: 'dog',
  cat: 'cat',
  bird: 'paw',
  small_animal: 'paw',
};

const SPECIES_TONE: Record<Pet['species'], TileTone> = {
  dog: 'amber',
  cat: 'slate',
  bird: 'sage',
  small_animal: 'clay',
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
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-paper p-5">
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
            className={`inline-flex size-12 shrink-0 items-center justify-center rounded-tile ${TONE_CLASSES[SPECIES_TONE[pet.species]]}`}
          >
            <PetIcon name={SPECIES_ICON[pet.species]} className="size-8" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-body text-title text-ink">{pet.name}</p>
          <p className="font-body text-xs text-ink-muted">
            {SPECIES_LABEL[pet.species]}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </p>
        </div>
      </header>

      <dl className="grid gap-2 font-body text-sm text-ink-secondary">
        {birth && (
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">Birthday</dt>
            <dd className="text-right text-ink">{birth}</dd>
          </div>
        )}
        {weight && (
          <div className="flex justify-between gap-2">
            <dt className="text-ink-muted">Weight</dt>
            <dd className="text-right text-ink">{weight}</dd>
          </div>
        )}
        {pet.dietaryNotes && (
          <div className="flex flex-col gap-0.5 border-t border-line pt-2">
            <dt className="text-ink-muted">Diet</dt>
            <dd className="text-ink">{pet.dietaryNotes}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pencil size={12} aria-hidden />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(pet.id)}
          disabled={disabled}
          className="ml-auto inline-flex items-center gap-1.5 font-body text-micro uppercase text-danger-solid opacity-90 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={12} aria-hidden />
          Delete
        </button>
      </div>
    </article>
  );
}
