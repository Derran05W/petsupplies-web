import { cn } from '@/lib/utils';
import { PetIcon } from './PetIcon';
import { SectionHeader } from './SectionHeader';

interface VideoBandProps {
  kicker: string;
  /** Heading content — `<em>` renders italic per the display style. */
  heading: React.ReactNode;
  /** Supporting copy under the heading. */
  children?: React.ReactNode;
  /**
   * Background footage — autoplays muted on loop, full-bleed behind the
   * copy (the mockup's "brand film" slot). When omitted, the band renders
   * the mockup's stand-in: amber/slate radial glows over ink, scattered
   * paw prints, and a centered decorative play circle.
   */
  videoSrc?: string;
  poster?: string;
  className?: string;
}

/** Deterministic paw scatter from the mockup's `filmPaws` loop — SSR-safe. */
const PAWS = Array.from({ length: 7 }, (_, i) => ({
  left: `${5 + i * 14}%`,
  top: `${15 + ((i * 37) % 60)}%`,
  rotate: `${i * 23}deg`,
}));

/**
 * Full-bleed film band from the mockup (`.film`): a 72vh dark section with
 * copy pinned to the bottom-left and a play affordance centered over the
 * footage. The play circle scales 1.12 and brightens on hover.
 */
export function VideoBand({
  kicker,
  heading,
  children,
  videoSrc,
  poster,
  className,
}: VideoBandProps) {
  return (
    <section
      className={cn(
        'relative flex min-h-[72vh] items-end overflow-hidden bg-ink px-[5vw] py-20 text-paper',
        !videoSrc && 'bg-film-glow',
        className,
      )}
    >
      {videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
          >
            {PAWS.map((paw, i) => (
              <PetIcon
                key={i}
                name="paw"
                className="absolute size-[70px] text-paper"
                style={{
                  left: paw.left,
                  top: paw.top,
                  transform: `rotate(${paw.rotate})`,
                }}
              />
            ))}
          </div>
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 flex size-[92px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--paper)_50%,transparent)] bg-[color-mix(in_srgb,var(--paper)_6%,transparent)] backdrop-blur-sm transition-all duration-[400ms] ease-soft hover:scale-[1.12] hover:bg-[color-mix(in_srgb,var(--paper)_14%,transparent)] motion-reduce:transform-none"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 size-[26px]"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      )}
      {videoSrc ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]"
        />
      ) : null}
      <div className="relative z-[2] max-w-[520px]">
        <SectionHeader kicker={kicker} dark>
          {heading}
        </SectionHeader>
        {children ? (
          <div className="mt-4 font-body leading-body text-[color-mix(in_srgb,var(--paper)_75%,transparent)]">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
