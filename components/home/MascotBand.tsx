import { emphasize, PetIcon, Reveal, SectionHeader } from '@/components/ui';
import { HOME_CONTENT } from '@/lib/site/home-content';

/**
 * Mascot band (mockup `.mascot`): a 4:5 portrait stage next to the
 * "Chief Eating Officer" copy. The stage shows the line-art stand-in
 * until `HOME_CONTENT.mascot.videoSrc` points at portrait footage.
 * Carries the `#about` anchor for nav links.
 */
export function MascotBand() {
  const { kicker, heading, paragraphs, signature, videoSrc, stageCaption } =
    HOME_CONTENT.mascot;

  return (
    <section
      id="about"
      aria-label="Meet the mascot"
      className="bg-panel px-gutter py-section"
    >
      <div className="mx-auto grid max-w-wrap items-center gap-12 md:grid-cols-[1fr_1.05fr] md:gap-20">
        <Reveal>
          <div className="relative flex aspect-[4/5] flex-col items-center justify-center gap-5 overflow-hidden rounded-card bg-[linear-gradient(160deg,#E8DFCE,#D9CDB4)]">
            {videoSrc ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <>
                <PetIcon
                  name="dog"
                  className="h-[34%] w-[34%] text-[#8A7147]"
                />
                <small className="px-10 text-center font-body text-micro uppercase leading-[1.8] text-ink-muted">
                  {stageCaption}
                </small>
              </>
            )}
          </div>
        </Reveal>
        <Reveal delay={150}>
          <SectionHeader kicker={kicker}>{emphasize(heading)}</SectionHeader>
          <div className="mt-6 max-w-[48ch] space-y-5 font-body leading-body text-ink-secondary">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 font-display text-[1.15rem] italic text-pine">
            {signature}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
