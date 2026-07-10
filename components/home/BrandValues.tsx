import { Reveal } from '@/components/ui';
import { fetchSiteSettings } from '@/lib/api/site/settings';
import { brandValueIcon } from '@/lib/site/brand-value-icons';
import { SITE_SETTINGS_FALLBACK } from '@/lib/site/fallbacks';

/**
 * Admin-managed brand value cards (up to 3), restyled for the boutique
 * look: hairline band, circled line-weight icons, Fraunces titles. Sits
 * below the featured grid, where the admin console says they appear.
 */
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
      className="border-y border-line px-gutter py-16"
    >
      <Reveal>
        <div className="mx-auto grid max-w-wrap gap-10 md:grid-cols-3">
          {values.map((value) => {
            const Icon = brandValueIcon(value.icon);
            return (
              <div key={value.title} className="flex items-start gap-5">
                <span
                  aria-hidden
                  className="flex size-11 flex-none items-center justify-center rounded-full border border-ink text-ink"
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="font-display text-title text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-1 font-body text-sm leading-body text-ink-secondary">
                    {value.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
