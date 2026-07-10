import { emphasize, VideoBand } from '@/components/ui';
import { HOME_CONTENT } from '@/lib/site/home-content';

/**
 * Full-bleed brand-film band. Renders the still placeholder (with the play
 * affordance) until `HOME_CONTENT.film.videoSrc` points at real footage.
 */
export function FilmBand() {
  const {
    kicker,
    heading,
    body,
    videoSrc,
    poster,
    videoPosition,
    imageSrc,
    imageAlt,
    imagePosition,
  } = HOME_CONTENT.film;

  return (
    <VideoBand
      kicker={kicker}
      heading={emphasize(heading)}
      videoSrc={videoSrc}
      poster={poster}
      videoPosition={videoPosition}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      imagePosition={imagePosition}
    >
      <p>{body}</p>
    </VideoBand>
  );
}
