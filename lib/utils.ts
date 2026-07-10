import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's stock utilities; it classifies our
 * custom `text-*` font sizes and `bg-*` gradients (tailwind.config.ts) as
 * colors, so e.g. `cn('text-display', 'text-ink')` would silently drop the
 * size. Register them in their real class groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display',
            'display-row',
            'title',
            'lede',
            'kicker',
            'label',
            'button',
            'micro',
          ],
        },
      ],
      'bg-image': [
        {
          bg: [
            'tile-amber',
            'tile-slate',
            'tile-sage',
            'tile-clay',
            'film-glow',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
