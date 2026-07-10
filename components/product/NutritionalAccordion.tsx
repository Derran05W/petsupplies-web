import { type NutritionalInfo } from '@/types/product';

interface NutritionalAccordionProps {
  info: NutritionalInfo;
}

/** Shared summary-row treatment: hairline row, title label, text +/−. */
function AccordionMarker() {
  return (
    <span
      aria-hidden
      className="font-body text-lg text-ink-muted transition-transform duration-base ease-soft group-open:rotate-45 motion-reduce:transform-none"
    >
      +
    </span>
  );
}

/**
 * Server-rendered `<details>`/`<summary>` accordion — no client JS.
 * Renders ingredients, a guaranteed-analysis table, and feeding
 * guidelines as hairline-separated rows.
 */
export function NutritionalAccordion({ info }: NutritionalAccordionProps) {
  return (
    <section
      aria-labelledby="nutrition-heading"
      className="mt-12 border-t border-line pt-8"
    >
      <h2
        id="nutrition-heading"
        className="mb-4 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Nutritional info
      </h2>
      <div className="flex flex-col border-b border-line">
        <details className="group border-t border-line">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-display text-lg tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
            Ingredients
            <AccordionMarker />
          </summary>
          <div className="pb-5 font-body text-sm leading-body text-ink-secondary">
            {info.ingredients}
          </div>
        </details>

        <details className="group border-t border-line">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-display text-lg tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
            Guaranteed analysis
            <AccordionMarker />
          </summary>
          <div className="pb-5">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {info.guaranteedAnalysis.map((row) => (
                <div
                  key={row.nutrient}
                  className="flex items-center justify-between border-b border-line py-2 last:border-b-0"
                >
                  <dt className="font-body text-sm text-ink-muted">
                    {row.nutrient}
                  </dt>
                  <dd className="font-display text-sm text-ink">
                    {row.percentage}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </details>

        <details className="group border-t border-line">
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-display text-lg tracking-[-0.01em] text-ink [&::-webkit-details-marker]:hidden">
            Feeding guidelines
            <AccordionMarker />
          </summary>
          <div className="pb-5 font-body text-sm leading-body text-ink-secondary">
            {info.feedingGuidelines}
          </div>
        </details>
      </div>
    </section>
  );
}
