import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { HomeMarquee } from '@/components/home/HomeMarquee';
import { StoryBand } from '@/components/home/StoryBand';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BrandValues } from '@/components/home/BrandValues';
import { FilmBand } from '@/components/home/FilmBand';
import { CategoryRows } from '@/components/home/CategoryRows';
import { MascotBand } from '@/components/home/MascotBand';
import { FooterCta } from '@/components/home/FooterCta';

/** Canonical lives per-page (the root layout deliberately sets none). */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Boutique homepage (design-references/aileens-boutique-mockup.html).
 * Sections stay admin-driven where the console has fields — hero copy +
 * image + CTAs, brand values, featured products, category rows, shipping
 * threshold — and pull the rest from lib/site/home-content.ts.
 */
export default function HomePage() {
  return (
    <div className="bg-paper text-ink">
      <Hero />
      <HomeMarquee />
      <StoryBand />
      <FeaturedProducts />
      <BrandValues />
      <FilmBand />
      <CategoryRows />
      <MascotBand />
      <FooterCta />
    </div>
  );
}
