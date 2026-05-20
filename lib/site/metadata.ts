import type { Metadata } from 'next';
import type { Brand } from '@/lib/config/brand';

export function buildRootMetadata(brand: Brand): Metadata {
  return {
    title: {
      default: `${brand.name} — ${brand.tagline}`,
      template: `%s · ${brand.name}`,
    },
    description: brand.description,
  };
}
