import type { SVGProps } from 'react';

/**
 * Line-art icon set from the boutique mockup
 * (design-references/aileens-boutique-mockup.html, `<defs>` block).
 * Stroke-based, 100×100 viewBox, inherits `currentColor` — size with
 * width/height or a Tailwind `size-*` class on the svg.
 */
export type PetIconName =
  | 'paw'
  | 'dog'
  | 'cat'
  | 'bone'
  | 'fish'
  | 'yarn'
  | 'bowl';

const PATHS: Record<PetIconName, React.ReactNode> = {
  paw: (
    <g>
      <ellipse cx="50" cy="62" rx="17" ry="14" />
      <ellipse cx="27" cy="42" rx="7" ry="9" transform="rotate(-18 27 42)" />
      <ellipse cx="42" cy="30" rx="7" ry="9" />
      <ellipse cx="58" cy="30" rx="7" ry="9" />
      <ellipse cx="73" cy="42" rx="7" ry="9" transform="rotate(18 73 42)" />
    </g>
  ),
  dog: (
    <g>
      <path d="M30 38 Q28 18 16 20 Q12 34 22 44" />
      <path d="M70 38 Q72 18 84 20 Q88 34 78 44" />
      <path d="M28 40 Q28 24 50 24 Q72 24 72 40 Q74 62 62 72 Q50 78 38 72 Q26 62 28 40 Z" />
      <circle cx="40" cy="46" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="60" cy="46" r="2.6" fill="currentColor" stroke="none" />
      <path d="M46 58 Q50 62 54 58" />
      <ellipse
        cx="50"
        cy="56"
        rx="4.5"
        ry="3.4"
        fill="currentColor"
        stroke="none"
      />
    </g>
  ),
  cat: (
    <g>
      <path d="M28 34 L24 14 L40 26" />
      <path d="M72 34 L76 14 L60 26" />
      <path d="M28 36 Q30 22 50 22 Q70 22 72 36 Q76 58 64 68 Q50 76 36 68 Q24 58 28 36 Z" />
      <circle cx="40" cy="44" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="60" cy="44" r="2.6" fill="currentColor" stroke="none" />
      <path d="M50 52 L46 56 M50 52 L54 56" />
      <path d="M20 50 L34 52 M20 60 L34 58 M80 50 L66 52 M80 60 L66 58" />
    </g>
  ),
  bone: (
    <path
      d="M32 40 Q22 30 28 22 Q36 16 42 24 Q48 16 56 22 L58 24 L76 42 Q84 36 90 44 Q94 52 86 58 Q94 64 88 72 Q80 78 74 70 Q68 78 60 72 L58 70 L40 52 Q32 58 26 50 Q22 42 32 40 Z"
      transform="scale(.86) translate(5 5)"
    />
  ),
  fish: (
    <g>
      <path d="M18 50 Q38 28 62 40 Q74 30 82 26 Q80 40 74 50 Q80 60 82 74 Q74 70 62 60 Q38 72 18 50 Z" />
      <circle cx="34" cy="46" r="2.6" fill="currentColor" stroke="none" />
    </g>
  ),
  yarn: (
    <g>
      <circle cx="48" cy="50" r="26" />
      <path d="M26 40 Q48 32 70 42 M24 52 Q48 46 72 54 M30 64 Q48 60 66 66 M74 56 Q88 62 92 76" />
    </g>
  ),
  bowl: (
    <g>
      <path d="M22 46 L78 46 Q76 70 50 72 Q24 70 22 46 Z" />
      <path d="M30 46 Q34 38 42 40 M50 46 Q52 36 62 38" />
    </g>
  ),
};

interface PetIconProps extends SVGProps<SVGSVGElement> {
  name: PetIconName;
}

export function PetIcon({ name, ...props }: PetIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={4.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
