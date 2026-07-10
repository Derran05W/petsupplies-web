import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PetIcon, type PetIconName } from './PetIcon';
import { PreviewImage } from './PreviewImage';
import { TONE_CLASSES, type TileTone } from './tones';

interface CategoryRowProps {
  href: string;
  name: string;
  /** Product count shown as "N products"; pass a string to override the suffix. */
  count: number | string;
  /** Line-art icon for the floating preview tile. Ignored when `imageUrl` is set. */
  icon?: PetIconName;
  imageUrl?: string;
  tone?: TileTone;
  className?: string;
}

/**
 * Big-text category list row from the mockup (`.cat-row`). On hover the
 * whole row indents 1.4rem, the Fraunces name turns italic, the circled
 * arrow fills ink and rotates -45°, and a preview tile pops in at right
 * (scale .7 / -5° → 1 / +3° with a lifted shadow). Preview hides below md,
 * matching the mockup's 720px cutoff.
 *
 * Rows draw their own top hairline and the last row closes with a bottom
 * one — stack them directly to reproduce the mockup list.
 */
export function CategoryRow({
  href,
  name,
  count,
  icon = 'paw',
  imageUrl,
  tone = 'amber',
  className,
}: CategoryRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center justify-between gap-8 border-t border-line px-1.5 py-[2.1rem] no-underline transition-[padding-left] duration-base ease-soft last:border-b hover:pl-6',
        className,
      )}
    >
      <span className="font-display text-display-row text-ink group-hover:italic">
        {name}
      </span>
      <span className="flex flex-none items-center gap-6">
        <span className="font-body text-[0.74rem] font-semibold uppercase tracking-count text-ink-muted">
          {typeof count === 'number' ? `${count} products` : count}
        </span>
        <span
          aria-hidden
          className="flex size-[46px] flex-none items-center justify-center rounded-full border border-ink text-ink transition-all duration-base ease-soft group-hover:-rotate-45 group-hover:bg-ink group-hover:text-paper motion-reduce:transform-none"
        >
          →
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-[16%] top-1/2 z-[5] hidden aspect-[1.25] w-[150px] -translate-y-1/2 -rotate-[5deg] scale-[0.7] items-center justify-center overflow-hidden rounded-card opacity-0 shadow-lifted transition-all duration-[400ms] ease-soft group-hover:rotate-3 group-hover:scale-100 group-hover:opacity-100 motion-reduce:rotate-0 motion-reduce:scale-100 md:flex',
          TONE_CLASSES[tone],
        )}
      >
        {imageUrl ? (
          <PreviewImage
            src={imageUrl}
            alt=""
            fill
            sizes="150px"
            className="object-cover"
            fallback={<PetIcon name={icon} className="h-[46%] w-[46%]" />}
          />
        ) : (
          <PetIcon name={icon} className="h-[46%] w-[46%]" />
        )}
      </span>
    </Link>
  );
}
