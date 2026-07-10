import { emphasize, Reveal, SectionHeader } from '@/components/ui';
import { HOME_CONTENT } from '@/lib/site/home-content';

/** Centered story band on the deeper panel background (mockup `.story`). */
export function StoryBand() {
  const { kicker, heading, body } = HOME_CONTENT.story;

  return (
    <section
      aria-label="Our story"
      className="bg-panel px-gutter py-section text-center"
    >
      <Reveal className="mx-auto max-w-wrap">
        <SectionHeader
          kicker={kicker}
          align="center"
          className="[&_h2]:max-w-[26ch]"
        >
          {emphasize(heading)}
        </SectionHeader>
        <p className="mx-auto mt-6 max-w-[56ch] font-body text-lede text-ink-secondary">
          {body}
        </p>
      </Reveal>
    </section>
  );
}
