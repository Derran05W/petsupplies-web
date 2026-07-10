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
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-tile bg-tile-slate text-tile-slate-ink"
      >
        <MapPin size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          No saved addresses yet
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          Save the addresses you ship to most often so checkout takes a single
          tap next time.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        Add your first
      </button>
    </section>
  );
}
