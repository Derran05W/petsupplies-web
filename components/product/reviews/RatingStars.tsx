import { Star } from 'lucide-react';

export type RatingStarsVariant = 'aggregate' | 'full';

interface AggregateProps {
  variant: 'aggregate';
  /** Average rating used only for optional screen reader copy. */
  value: number;
  size: number;
  /** When false, rely on an ancestor `aria-label` for accessibility. */
  announce?: boolean;
}

interface FullProps {
  variant: 'full';
  /** Whole-star rating (1–5). */
  value: number;
  size: number;
}

export type RatingStarsProps = AggregateProps | FullProps;

/**
 * Shared star visuals for cards, PDP summary, review rows, and forms.
 * Aggregate variant keeps the legacy single-star chip look on grids.
 */
export function RatingStars(props: RatingStarsProps) {
  if (props.variant === 'aggregate') {
    const announce = props.announce ?? true;
    return (
      <>
        <Star size={props.size} aria-hidden className="fill-amber text-amber" />
        {announce ? (
          <span className="sr-only">
            Rated {props.value.toFixed(1)} out of 5 stars
          </span>
        ) : null}
      </>
    );
  }

  const filled = Math.min(5, Math.max(0, Math.round(props.value)));

  return (
    <div
      role="img"
      aria-label={`Rated ${filled} out of 5 stars`}
      className="flex gap-0.5"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={props.size}
          aria-hidden
          className={
            i < filled
              ? 'fill-amber text-amber'
              : 'fill-transparent text-ink-faint'
          }
        />
      ))}
    </div>
  );
}
