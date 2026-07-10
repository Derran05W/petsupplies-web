'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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
  /** CSS object-position for the footage, e.g. `'50% 60%'` to keep the subject in frame. */
  videoPosition?: string;
  /**
   * Still placeholder shown full-bleed (with the play affordance) until
   * `videoSrc` exists. Ignored when `videoSrc` is set.
   */
  imageSrc?: string;
  imageAlt?: string;
  /** CSS object-position for the still, e.g. `'50% 30%'` to keep the subject in frame. */
  imagePosition?: string;
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
  videoPosition = '50% 50%',
  imageSrc,
  imageAlt = '',
  imagePosition = '50% 50%',
  className,
}: VideoBandProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion: never autoplay the footage; show the
  // poster / static frame instead.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Lazy-load: keep the video out of the DOM until the band scrolls into
  // view, so its footage never downloads on pages the user never reaches.
  useEffect(() => {
    if (!videoSrc) return;
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [videoSrc]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative flex min-h-[72vh] items-end overflow-hidden bg-ink px-[5vw] py-20 text-paper',
        !videoSrc && !imageSrc && 'bg-film-glow',
        className,
      )}
    >
      {videoSrc ? (
        inView ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: videoPosition }}
            src={videoSrc}
            poster={poster}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : null
      ) : (
        <>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: imagePosition }}
            />
          ) : (
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
          )}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 z-[1] flex size-[92px] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--paper)_50%,transparent)] bg-[color-mix(in_srgb,var(--paper)_6%,transparent)] backdrop-blur-sm transition-all duration-[400ms] ease-soft hover:scale-[1.12] hover:bg-[color-mix(in_srgb,var(--paper)_14%,transparent)] motion-reduce:transform-none"
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
      {videoSrc || imageSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_35%,transparent)]"
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
