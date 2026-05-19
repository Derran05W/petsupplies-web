import { MapPin } from 'lucide-react';

interface AddressesEmptyProps {
  onAdd: () => void;
}

/**
 * Empty-state panel for the addresses page. `role="status"` so SR users
 * understand this is a "nothing yet" state, not an error.
 *
 * NOTE: this is a server component conceptually but takes a callback
 * prop, so the parent (`<AddressBook />`) — which is `'use client'` —
 * is the rendering context. No `'use client'` directive needed here
 * because this file doesn't import client APIs.
 */
export function AddressesEmpty({ onAdd }: AddressesEmptyProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-warm-300 bg-surface-card px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <MapPin size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
          No saved addresses yet
        </h2>
        <p className="max-w-sm font-body text-sm text-warm-600">
          Save the addresses you ship to most often so checkout takes a single
          tap next time.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Add your first
      </button>
    </section>
  );
}
