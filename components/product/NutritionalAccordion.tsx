import { ChevronDown } from 'lucide-react';
import { type NutritionalInfo } from '@/types/product';

interface NutritionalAccordionProps {
  info: NutritionalInfo;
}

/**
 * Server-rendered `<details>`/`<summary>` accordion — no client JS.
 * Renders ingredients, a guaranteed-analysis table, and feeding
 * guidelines.
 */
export function NutritionalAccordion({ info }: NutritionalAccordionProps) {
  return (
    <section
      aria-labelledby="nutrition-heading"
      className="mt-12 border-t border-warm-200 pt-8"
    >
      <h2
        id="nutrition-heading"
        className="mb-4 font-display text-2xl tracking-[-0.02em] text-warm-900"
      >
        Nutritional info
      </h2>
      <div className="flex flex-col gap-3">
        <details className="group rounded-xl border border-warm-200 bg-surface-card">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-lg tracking-[-0.02em] text-warm-900 [&::-webkit-details-marker]:hidden">
            Ingredients
            <ChevronDown
              size={18}
              aria-hidden
              className="text-warm-600 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-warm-200 px-5 py-4 font-body text-sm leading-relaxed text-warm-600">
            {info.ingredients}
          </div>
        </details>

        <details className="group rounded-xl border border-warm-200 bg-surface-card">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-lg tracking-[-0.02em] text-warm-900 [&::-webkit-details-marker]:hidden">
            Guaranteed analysis
            <ChevronDown
              size={18}
              aria-hidden
              className="text-warm-600 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-warm-200 px-5 py-4">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {info.guaranteedAnalysis.map((row) => (
                <div
                  key={row.nutrient}
                  className="flex items-center justify-between border-b border-warm-100 py-2 last:border-b-0"
                >
                  <dt className="font-body text-sm text-warm-600">
                    {row.nutrient}
                  </dt>
                  <dd className="font-body text-sm font-medium text-warm-900">
                    {row.percentage}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </details>

        <details className="group rounded-xl border border-warm-200 bg-surface-card">
          <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-lg tracking-[-0.02em] text-warm-900 [&::-webkit-details-marker]:hidden">
            Feeding guidelines
            <ChevronDown
              size={18}
              aria-hidden
              className="text-warm-600 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-warm-200 px-5 py-4 font-body text-sm leading-relaxed text-warm-600">
            {info.feedingGuidelines}
          </div>
        </details>
      </div>
    </section>
  );
}
