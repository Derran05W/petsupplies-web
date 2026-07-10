import { PetIcon, TONE_CLASSES } from '@/components/ui';

interface PetsEmptyProps {
  onAdd: () => void;
  disableAdd?: boolean;
}

export function PetsEmpty({ onAdd, disableAdd = false }: PetsEmptyProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line bg-paper px-6 py-14 text-center"
    >
      <span
        aria-hidden
        className={`inline-flex size-12 items-center justify-center rounded-tile ${TONE_CLASSES.amber}`}
      >
        <PetIcon name="paw" className="size-8" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
          No pet profiles yet
        </h2>
        <p className="max-w-sm font-body text-sm leading-body text-ink-secondary">
          Add your companions so we can tailor recommendations and preferences
          when you&apos;re ready.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disableAdd}
        className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        Add your first pet
      </button>
    </section>
  );
}
