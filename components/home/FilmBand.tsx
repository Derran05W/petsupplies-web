import { emphasize, VideoBand } from '@/components/ui';
import { HOME_CONTENT } from '@/lib/site/home-content';

/**
 * Full-bleed brand-film band. Renders the tonal stand-in (glows, paw
 * scatter, play circle) until `HOME_CONTENT.film.videoSrc` points at real
 * footage.
 */
export function FilmBand() {
  const { kicker, heading, body, videoSrc, poster } = HOME_CONTENT.film;

  return (
    <VideoBand
      kicker={kicker}
      heading={emphasize(heading)}
      videoSrc={videoSrc}
      poster={poster}
    >
      <p>{body}</p>
    </VideoBand>
  );
}
