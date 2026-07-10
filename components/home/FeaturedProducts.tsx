import Link from 'next/link';
import {
  emphasize,
  ProductCard,
  Reveal,
  SectionHeader,
  TILE_TONES,
} from '@/components/ui';
import { fetchFeaturedProducts } from '@/lib/api/site/featured-products';
import { HOME_CONTENT } from '@/lib/site/home-content';

/**
 * Featured grid (mockup `#shop`) — the admin-curated featured products on
 * image-first cards with cycling tonal tiles and hover quick-add.
 */
export async function FeaturedProducts() {
  const products = await fetchFeaturedProducts();
  const { kicker, heading, viewAllLabel } = HOME_CONTENT.featured;

  return (
    <section
      id="shop"
      aria-labelledby="featured-heading"
      className="px-gutter py-section"
    >
      <div className="mx-auto max-w-wrap">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
            <SectionHeader kicker={kicker} headingId="featured-heading">
              {emphasize(heading)}
            </SectionHeader>
            <Link
              href="/products"
              className="border-b border-ink pb-1 font-body text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-ink no-underline transition-opacity duration-fast hover:opacity-60"
            >
              {viewAllLabel}
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-6 gap-y-9">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 70}>
              <ProductCard
                product={product}
                tone={TILE_TONES[index % TILE_TONES.length]}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
