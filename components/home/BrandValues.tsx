import { fetchSiteSettings } from '@/lib/api/site/settings';
import { brandValueIcon } from '@/lib/site/brand-value-icons';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';

export async function BrandValues() {
  const settings = await fetchSiteSettings();
  const values =
    settings.brandValues.length > 0
      ? settings.brandValues.slice(0, 3)
      : SITE_SETTINGS_FALLBACK.brandValues;

  if (values.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Why shop with us"
      className="bg-warm-100/60 border-y border-warm-200"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 md:px-8 md:py-16 lg:px-12">
        {values.map((value) => {
          const Icon = brandValueIcon(value.icon);
          return (
            <div key={value.title} className="flex items-start gap-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon size={18} aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl tracking-[-0.02em] text-warm-900">
                  {value.title}
                </h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-warm-600">
                  {value.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
