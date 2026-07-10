import Link from 'next/link';
import type { Brand } from '@/lib/config/brand';
import { WORDMARK_CLASSES } from '@/components/ui';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  brand: Brand;
  className?: string;
  /** When omitted, renders a non-link span (e.g. mobile menu header). */
  href?: string | null;
}

export function BrandLogo({ brand, className, href = '/' }: BrandLogoProps) {
  const classes = cn(WORDMARK_CLASSES, className);

  if (href) {
    return (
      <Link href={href} aria-label={brand.name} className={classes}>
        {brand.name}
      </Link>
    );
  }

  return (
    <span className={cn(classes, 'inline-block')} aria-hidden>
      {brand.name}
    </span>
  );
}
