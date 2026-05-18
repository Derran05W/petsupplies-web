import { PawPrint } from 'lucide-react';

interface PetsEmptyProps {
  onAdd: () => void;
  disableAdd?: boolean;
}

export function PetsEmpty({ onAdd, disableAdd = false }: PetsEmptyProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-warm-300 bg-white px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className="inline-flex size-12 items-center justify-center rounded-full bg-warm-100 text-warm-600"
      >
        <PawPrint size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl tracking-[-0.02em] text-warm-900">
          No pet profiles yet
        </h2>
        <p className="max-w-sm font-body text-sm text-warm-600">
          Add your companions so we can tailor recommendations and preferences
          when you&apos;re ready.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disableAdd}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Add your first pet
      </button>
    </section>
  );
}
