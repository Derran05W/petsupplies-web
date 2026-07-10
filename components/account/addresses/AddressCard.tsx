'use client';

import { useState } from 'react';
import { Pencil, Star, Trash2 } from 'lucide-react';
import type { Address } from '@/types/account';
import type { AddressInput } from '@/lib/account/schemas';
import { AddressForm } from './AddressForm';

interface AddressCardProps {
  address: Address;
  /** Called when the customer saves an edit. Returns/promises an error message
   * to show inline when the mutation fails (or null on success). */
  onSave: (input: AddressInput) => Promise<string | null>;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  /** Disable the row's mutating actions while a separate mutation is busy. */
  disabled?: boolean;
}

function toFormInput(address: Address): AddressInput {
  return {
    fullName: address.fullName,
    line1: address.line1,
    line2: address.line2 ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country as AddressInput['country'],
    isDefault: address.isDefault,
  };
}

/**
 * Single saved-address card. Edit toggles the inline `<AddressForm />`
 * in place of the read view (rather than opening a separate modal) so
 * the optimistic update doesn't fight a portal.
 */
export function AddressCard({
  address,
  onSave,
  onSetDefault,
  onDelete,
  disabled = false,
}: AddressCardProps) {
  const [editing, setEditing] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [savingEdit, setSavingEdit] = useState(false);

  if (editing) {
    return (
      <AddressForm
        initial={toFormInput(address)}
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
            const error = await onSave(values);
            if (error) {
              setSubmitError(error);
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

  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-line bg-paper p-5">
      <header className="flex items-start justify-between gap-3">
        <p className="font-body text-title text-ink">{address.fullName}</p>
        {address.isDefault && (
          <span className="border-pine/40 inline-flex items-center gap-1 rounded-tag border bg-tile-sage px-2 py-0.5 font-body text-micro uppercase text-tile-sage-ink">
            <Star size={10} aria-hidden />
            Default
          </span>
        )}
      </header>
      <address className="font-body text-sm not-italic leading-body text-ink-muted">
        {address.line1}
        {address.line2 ? (
          <>
            <br />
            {address.line2}
          </>
        ) : null}
        <br />
        {address.city}, {address.state} {address.postalCode}
        <br />
        {address.country}
      </address>
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
        {!address.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Star size={12} aria-hidden />
            Set as default
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(address.id)}
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
