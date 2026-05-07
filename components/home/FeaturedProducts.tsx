import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { FEATURED_PRODUCTS } from '@/lib/placeholder/products';

export function FeaturedProducts() {
  return (
    <section
      aria-labelledby="featured-heading"
      className="px-6 py-16 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600">
              Customer favourites
            </p>
            <h2
              id="featured-heading"
              className="font-display text-3xl tracking-[-0.02em] text-warm-900 md:text-4xl"
            >
              Everyday meals, thoughtfully made.
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden shrink-0 font-body text-sm text-brand-600 transition-colors hover:text-brand-700 md:inline-block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_PRODUCTS.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
