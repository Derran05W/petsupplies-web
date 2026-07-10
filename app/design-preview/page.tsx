import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';
import {
  Button,
  CategoryRow,
  Marquee,
  Nav,
  ProductCard,
  Reveal,
  SectionHeader,
  TILE_TONES,
  TopBar,
  VideoBand,
} from '@/components/ui';

/**
 * TEMPORARY component-library preview — visual QA for the boutique
 * redesign pieces before the homepage assembly pass. Not linked from
 * anywhere; delete once the real pages consume components/ui.
 */
export default function DesignPreviewPage() {
  return (
    <div className="bg-paper text-ink">
      <TopBar>
        Free local delivery on orders over $40 · Oshawa &amp; beyond
      </TopBar>
      <Nav
        wordmark="Aileen's"
        links={[
          { label: 'Shop', href: '/products' },
          { label: 'Dogs', href: '/products?petType=dog' },
          { label: 'Cats', href: '/products?petType=cat' },
          { label: 'About', href: '/#about' },
        ]}
      />

      <section className="px-gutter py-16 text-center">
        <SectionHeader kicker="Buttons" align="center">
          Solid &amp; <em>ghost</em> pills.
        </SectionHeader>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/products">Shop favourites</Button>
          <Button variant="ghost">Meet the inspector</Button>
        </div>
      </section>

      <Marquee
        items={[
          'Honest food',
          'Small-batch treats',
          'Toys that last',
          'For dogs & cats',
          'Picked by hand',
        ]}
      />

      <section className="px-gutter py-section">
        <div className="mx-auto max-w-wrap">
          <Reveal>
            <SectionHeader kicker="Customer favourites">
              The current <em>obsessions.</em>
            </SectionHeader>
          </Reveal>
          <div className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-6 gap-y-9">
            {FEATURED_PRODUCTS.slice(0, 4).map((product, i) => (
              <Reveal key={product.id} delay={i * 70}>
                <ProductCard
                  product={product}
                  tone={TILE_TONES[i % TILE_TONES.length]}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VideoBand
        kicker="Behind the shop"
        heading={<>Thirty seconds of extremely serious quality control.</>}
      >
        <p>
          This full-bleed band autoplays muted on loop — the single best home
          for footage of her pet &quot;testing&quot; products.
        </p>
      </VideoBand>

      <section className="px-gutter py-section">
        <div className="mx-auto max-w-wrap">
          <Reveal>
            <SectionHeader kicker="Shop by">
              Everything they&apos;ve been <em>hinting</em> at.
            </SectionHeader>
          </Reveal>
          <div className="mt-10">
            <CategoryRow
              href="/products?petType=dog"
              name="Dog Food & Treats"
              count={18}
              icon="dog"
              tone="amber"
            />
            <CategoryRow
              href="/products?petType=cat"
              name="Cat Food & Treats"
              count={14}
              icon="cat"
              tone="slate"
            />
            <CategoryRow
              href="/products?category=accessories"
              name="Toys"
              count={22}
              icon="yarn"
              tone="sage"
            />
            <CategoryRow
              href="/products?category=accessories"
              name="Accessories"
              count={11}
              icon="bowl"
              tone="clay"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
