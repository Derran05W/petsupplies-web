import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { type Metadata } from 'next';
import { brand } from '@/lib/config/brand';
import { getProducts } from '@/lib/api/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductSkeletonGrid } from '@/components/product/ProductSkeleton';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { FilterDrawer } from '@/components/product/FilterDrawer';
import { SearchBox } from '@/components/product/SearchBox';
import { SortDropdown } from '@/components/product/SortDropdown';
import { Pagination } from '@/components/product/Pagination';
import {
  activeFilterCount,
  legacyProductListingRedirectPath,
  parseProductFilters,
} from '@/lib/utils/searchParams';

export const metadata: Metadata = {
  title: 'Shop all products',
  description: `Browse the full ${brand.name} catalogue — food, treats, accessories, and healthcare for dogs, cats, and small companions.`,
};

interface ProductsPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Async server component that fetches the listing for the current
 * `searchParams` and renders the grid + pagination. Wrapped in
 * `<Suspense>` from the parent so the page shell paints immediately and
 * the grid streams in.
 */
async function ProductsResults({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseProductFilters(searchParams);
  const data = await getProducts(filters);

  return (
    <>
      <ProductGrid products={data.products} />
      <Pagination currentPage={data.page} totalPages={data.totalPages} />
      <p className="mt-6 text-center font-body text-micro uppercase text-ink-muted">
        {data.total === 0
          ? 'No products to show.'
          : `Showing ${data.products.length} of ${data.total} ${
              data.total === 1 ? 'product' : 'products'
            }`}
      </p>
    </>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const redirectPath = legacyProductListingRedirectPath(searchParams);
  if (redirectPath) redirect(redirectPath);

  const filters = parseProductFilters(searchParams);
  const filterCount = activeFilterCount(filters);
  const suspenseKey = JSON.stringify(filters);

  return (
    <section className="bg-paper px-gutter pb-24 pt-12 text-ink md:pt-16">
      <div className="mx-auto flex max-w-wrap flex-col">
        <header className="mb-10 flex flex-col gap-4">
          <p className="font-body text-kicker uppercase text-pine">Shop</p>
          <h1 className="max-w-[22ch] font-display text-display text-ink [&_em]:font-medium [&_em]:italic">
            Everything for everyone with <em>paws</em>.
          </h1>
          <p className="max-w-2xl font-body text-lede leading-body text-ink-secondary">
            Thoughtfully sourced food, treats, accessories, and healthcare —
            curated for every pet in your home.
          </p>
        </header>

        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-center md:justify-between">
          <SearchBox />
          <div className="flex items-center justify-between gap-4">
            <FilterDrawer activeCount={filterCount} />
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-12">
          <FilterSidebar />
          <div className="min-w-0 flex-1">
            <Suspense
              key={suspenseKey}
              fallback={<ProductSkeletonGrid count={9} />}
            >
              <ProductsResults searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
