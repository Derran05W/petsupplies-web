import { Button, emphasize, Reveal, SectionHeader } from '@/components/ui';
import { fetchSiteSettings } from '@/lib/api/site/settings';
import { HOME_CONTENT } from '@/lib/site/home-content';
import { RotatingJoke } from './RotatingJoke';

/**
 * Closing CTA (mockup `.fcta`). The button reuses the admin's primary
 * hero CTA destination so "Start shopping" always lands wherever the
 * console points the main call to action.
 */
export async function FooterCta() {
  const settings = await fetchSiteSettings();
  const { kicker, heading, ctaLabel, jokes } = HOME_CONTENT.footerCta;

  return (
    <section
      aria-label="Start shopping"
      className="px-gutter py-36 text-center"
    >
      <Reveal>
        <SectionHeader
          kicker={kicker}
          align="center"
          className="[&_h2]:max-w-[20ch]"
        >
          {emphasize(heading)}
        </SectionHeader>
        <Button href={settings.heroPrimaryCtaHref} className="mt-10">
          {ctaLabel}
        </Button>
        <RotatingJoke jokes={jokes} />
      </Reveal>
    </section>
  );
}
