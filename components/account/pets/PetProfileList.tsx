'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { isPetCapacityApiError } from '@/lib/api/pets';
import {
  petProfileFormValuesToPetInput,
  type PetInput,
  type PetProfileFormValues,
} from '@/lib/account/schemas';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import {
  useCreatePetMutation,
  useDeletePetMutation,
  usePetsQuery,
  useUpdatePetMutation,
} from '@/hooks/usePets';
import type { Pet, PetId } from '@/types/pet';
import { PetProfileCard } from './PetProfileCard';
import { PetProfileForm } from './PetProfileForm';
import { PetsEmpty } from './PetsEmpty';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong saving that pet. Please try again.';

export function PetProfileList() {
  const query = usePetsQuery();
  const createMutation = useCreatePetMutation();
  const updateMutation = useUpdatePetMutation();
  const deleteMutation = useDeletePetMutation();

  const [adding, setAdding] = useState(false);
  const [topError, setTopError] = useState<string | undefined>();
  const [capacityBlock, setCapacityBlock] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Pet | null>(null);

  const pets = query.data ?? [];
  const someMutationBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  function errorMessageFor(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.isNetworkError) return NETWORK_ERROR_MESSAGE;
      if (err.status === 401) return SESSION_ERROR_MESSAGE;
      return err.message || GENERIC_ERROR_MESSAGE;
    }
    return GENERIC_ERROR_MESSAGE;
  }

  function classifyCapacityConflict(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 422) return false;
    if (isPetCapacityApiError(err.message, err.status)) return true;
    const flat = Object.values(err.validationErrors ?? {}).flat();
    const joined = flat.join(' ').toLowerCase();
    return (
      joined.includes('max') ||
      joined.includes('limit') ||
      joined.includes('too many')
    );
  }

  const handleCreate = async (values: PetProfileFormValues) => {
    setTopError(undefined);
    try {
      const input = petProfileFormValuesToPetInput(values);
      await createMutation.mutateAsync(input);
      setAdding(false);
      setCapacityBlock(false);
    } catch (err) {
      setTopError(errorMessageFor(err));
      if (classifyCapacityConflict(err)) setCapacityBlock(true);
    }
  };

  const handleUpdate =
    (id: PetId) =>
    async (input: PetInput): Promise<string | null> => {
      setTopError(undefined);
      try {
        await updateMutation.mutateAsync({ id, input });
        return null;
      } catch (err) {
        return errorMessageFor(err);
      }
    };

  const handleDeletePrompt = (id: PetId) => {
    const target = pets.find((p) => p.id === id);
    if (!target) return;
    setPendingDelete(target);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setTopError(undefined);
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setPendingDelete(null);
        setCapacityBlock(false);
      },
      onError: (err) => {
        setTopError(errorMessageFor(err));
        setPendingDelete(null);
      },
    });
  };

  if (query.isLoading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-card border border-dashed border-line bg-paper">
        <Loader2
          size={20}
          aria-label="Loading pets"
          className="animate-spin text-ink-muted"
        />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div
        role="alert"
        className="rounded-card border border-danger-border bg-danger-surface px-5 py-4 font-body text-sm text-danger-solid"
      >
        {errorMessageFor(query.error)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {capacityBlock && (
        <div
          role="alert"
          aria-live="polite"
          className="border-amber/40 rounded-tile border bg-tile-amber px-4 py-3 font-body text-sm text-tile-amber-ink"
        >
          You&apos;ve reached the pet profile limit. Delete a pet to add
          another.
        </div>
      )}
      {topError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
        >
          {topError}
        </div>
      )}

      {!adding && pets.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={capacityBlock}
            onClick={() => {
              setAdding(true);
              setTopError(undefined);
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} aria-hidden />
            Add a pet
          </button>
        </div>
      )}

      {adding && (
        <PetProfileForm
          submitLabel="Add pet"
          busy={createMutation.isPending}
          onCancel={() => {
            setAdding(false);
            setTopError(undefined);
          }}
          onSubmit={handleCreate}
        />
      )}

      {pets.length === 0 && !adding ? (
        <PetsEmpty onAdd={() => setAdding(true)} disableAdd={capacityBlock} />
      ) : (
        pets.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pets.map((pet) => (
              <PetProfileCard
                key={pet.id}
                pet={pet}
                disabled={someMutationBusy}
                onSave={handleUpdate(pet.id)}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this pet?"
        description={
          pendingDelete
            ? `${pendingDelete.name} · ${pendingDelete.species}`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(null);
        }}
      />
    </div>
  );
}
