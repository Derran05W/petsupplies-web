import { Suspense } from 'react';
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
  parseProductFilters,
} from '@/lib/utils/searchParams';

export const metadata: Metadata = {
  title: 'Shop all products',
  description: `Browse the full ${brand.name} catalogue — food, treats, accessories, and healthcare for every pet.`,
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
      <p className="mt-6 text-center font-body text-xs text-warm-400">
        {data.total === 0
          ? 'No products to show.'
          : `Showing ${data.products.length} of ${data.total} ${
              data.total === 1 ? 'product' : 'products'
            }.`}
      </p>
    </>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseProductFilters(searchParams);
  const filterCount = activeFilterCount(filters);
  const suspenseKey = JSON.stringify(filters);

  return (
    <section className="px-6 pb-20 pt-10 md:px-8 md:pt-14 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col">
        <header className="mb-8 flex flex-col gap-3">
          <p className="font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600">
            Shop
          </p>
          <h1 className="font-display text-4xl tracking-[-0.02em] text-warm-900 md:text-5xl">
            Everything for everyone with paws.
          </h1>
          <p className="max-w-2xl font-body text-base text-warm-600">
            Thoughtfully sourced food, treats, accessories, and healthcare —
            curated for every pet in your home.
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBox />
          <div className="flex items-center justify-between gap-3">
            <FilterDrawer activeCount={filterCount} />
            <SortDropdown />
          </div>
        </div>

        <div className="flex gap-10">
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
