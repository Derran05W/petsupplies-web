'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from '@/hooks/useAddresses';
import type { Address, AddressId } from '@/types/account';
import type { AddressInput } from '@/lib/account/schemas';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { AddressesEmpty } from './AddressesEmpty';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong saving that address. Please try again.';

function errorMessageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return NETWORK_ERROR_MESSAGE;
    if (err.status === 401) return SESSION_ERROR_MESSAGE;
    return err.message || GENERIC_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}

/**
 * Top-level CRUD island for `/account/addresses`. Owns:
 *   - the "add new address" panel toggle
 *   - the delete-confirmation dialog
 *   - top-of-page error summary for failed mutations
 *
 * Per-card edit forms are owned by `<AddressCard />` so an Add panel
 * and an Edit panel can coexist without state collisions.
 */
export function AddressBook() {
  const query = useAddressesQuery();
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const deleteMutation = useDeleteAddressMutation();
  const setDefaultMutation = useSetDefaultAddressMutation();

  const [adding, setAdding] = useState(false);
  const [topError, setTopError] = useState<string | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);

  const addresses = query.data ?? [];
  const someMutationBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending;

  const handleCreate = async (values: AddressInput) => {
    setTopError(undefined);
    try {
      await createMutation.mutateAsync(values);
      setAdding(false);
    } catch (err) {
      setTopError(errorMessageFor(err));
    }
  };

  const handleUpdate =
    (id: AddressId) =>
    async (values: AddressInput): Promise<string | null> => {
      setTopError(undefined);
      try {
        await updateMutation.mutateAsync({ id, input: values });
        return null;
      } catch (err) {
        return errorMessageFor(err);
      }
    };

  const handleSetDefault = (id: AddressId) => {
    setTopError(undefined);
    setDefaultMutation.mutate(id, {
      onError: (err) => setTopError(errorMessageFor(err)),
    });
  };

  const handleDelete = (id: AddressId) => {
    const target = addresses.find((addr) => addr.id === id);
    if (!target) return;
    setPendingDelete(target);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setTopError(undefined);
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
      onError: (err) => {
        setTopError(errorMessageFor(err));
        setPendingDelete(null);
      },
    });
  };

  if (query.isLoading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-warm-300 bg-surface-card">
        <Loader2
          size={20}
          aria-label="Loading addresses"
          className="animate-spin text-warm-600"
        />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-body text-sm text-red-700"
      >
        {errorMessageFor(query.error)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {topError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700"
        >
          {topError}
        </div>
      )}

      {!adding && addresses.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setTopError(undefined);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            <Plus size={14} aria-hidden />
            Add a new address
          </button>
        </div>
      )}

      {adding && (
        <AddressForm
          submitLabel="Add address"
          busy={createMutation.isPending}
          onCancel={() => {
            setAdding(false);
            setTopError(undefined);
          }}
          onSubmit={handleCreate}
        />
      )}

      {addresses.length === 0 && !adding ? (
        <AddressesEmpty onAdd={() => setAdding(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              disabled={someMutationBusy}
              onSave={handleUpdate(address.id)}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this address?"
        description={
          pendingDelete
            ? `${pendingDelete.fullName} · ${pendingDelete.line1}, ${pendingDelete.city}`
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
