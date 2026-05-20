import Link from 'next/link';
import type { Brand } from '@/lib/config/brand';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  brand: Brand;
  className?: string;
  /** When omitted, renders a non-link span (e.g. mobile menu header). */
  href?: string | null;
}

function LogoWords({ brand }: { brand: Brand }) {
  const words = brand.name.split(' ');
  const n = Math.max(1, brand.logoAccentWords ?? 1);
  const accent = words.slice(0, n).join(' ');
  const rest = words.slice(n).join(' ');

  return (
    <>
      <span className="text-brand-600">{accent}</span>
      {rest.length > 0 ? <span>{rest}</span> : null}
    </>
  );
}

export function BrandLogo({ brand, className, href = '/' }: BrandLogoProps) {
  const classes = cn(
    'inline-flex items-baseline gap-0.5 font-body text-lg font-medium text-warm-900',
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={brand.name} className={classes}>
        <LogoWords brand={brand} />
      </Link>
    );
  }

  return (
    <span className={classes} aria-hidden>
      <LogoWords brand={brand} />
    </span>
  );
}
