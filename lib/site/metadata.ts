import type { Metadata } from 'next';
import type { Brand } from '@/lib/config/brand';

/**
 * Absolute origin the storefront is served from, used as `metadataBase`
 * and to build canonical / OG URLs. Reads `NEXT_PUBLIC_SITE_URL`
 * (documented in `.env.local.example`) and falls back to localhost for
 * local dev. Any trailing slash is trimmed so callers can join paths.
 */
export function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export function buildRootMetadata(brand: Brand): Metadata {
  const siteUrl = resolveSiteUrl();
  const defaultTitle = `${brand.name} — ${brand.tagline}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: `%s · ${brand.name}`,
    },
    description: brand.description,
    // No root-level alternates/og url: App Router inherits top-level metadata
    // keys, so a canonical or og:url set here would claim every page that
    // doesn't override it is the homepage. Pages own their canonical URLs.
    openGraph: {
      type: 'website',
      siteName: brand.name,
      locale: 'en_US',
      title: defaultTitle,
      description: brand.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: brand.description,
    },
  };
}
