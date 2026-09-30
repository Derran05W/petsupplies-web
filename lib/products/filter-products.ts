import {
  CATEGORY_LABEL,
  PET_TYPE_LABEL,
  type Product,
  type ProductFilters,
  type ProductListResponse,
  type ProductSort,
} from '@/types/product';

/** Fetch page size when filtering/searching client-side against the catalog API. */
export const CLIENT_FILTER_PAGE_SIZE = 100;

export function needsClientSideProductFilter(filters: ProductFilters): boolean {
  return (
    hasShelfFilters(filters) ||
    Boolean(filters.search && filters.search.trim().length > 0)
  );
}

export function hasShelfFilters(filters: ProductFilters): boolean {
  return Boolean(
    (filters.categories && filters.categories.length > 0) || filters.petType,
  );
}

export function productSearchHaystack(product: Product): string {
  const categoryLabels = product.categories
    .map((c) => CATEGORY_LABEL[c])
    .join(' ');
  return `${product.name} ${product.slug} ${product.description} ${product.tags.join(' ')} ${PET_TYPE_LABEL[product.petType]} ${categoryLabels}`.toLowerCase();
}

/**
 * Match every whitespace-separated token against name, description, tags,
 * and display labels so queries like "dog treats" work without exact phrases.
 */
export function productMatchesSearch(
  product: Product,
  search: string | undefined,
): boolean {
  const query = search?.trim().toLowerCase() ?? '';
  if (query.length === 0) return true;

  const haystack = productSearchHaystack(product);
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function productMatchesShelfFilters(
  product: Product,
  filters: ProductFilters,
): boolean {
  if (
    filters.categories &&
    filters.categories.length > 0 &&
    !product.categories.some((c) => filters.categories!.includes(c))
  ) {
    return false;
  }
  if (filters.petType && product.petType !== filters.petType) return false;
  return true;
}

export function productMatchesFilters(
  product: Product,
  filters: ProductFilters,
): boolean {
  if (!productMatchesShelfFilters(product, filters)) return false;

  if (
    typeof filters.minPriceCents === 'number' &&
    product.priceCents < filters.minPriceCents
  ) {
    return false;
  }
  if (
    typeof filters.maxPriceCents === 'number' &&
    product.priceCents > filters.maxPriceCents
  ) {
    return false;
  }

  return productMatchesSearch(product, filters.search);
}

function compareBySort(sort: ProductSort) {
  return (a: Product, b: Product): number => {
    switch (sort) {
      case 'price_asc':
        return a.priceCents - b.priceCents;
      case 'price_desc':
        return b.priceCents - a.priceCents;
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'relevance':
      default:
        return 0;
    }
  };
}

export function filterAndPaginateProducts(
  products: Product[],
  filters: ProductFilters,
): ProductListResponse {
  const filtered = products.filter((product) =>
    productMatchesFilters(product, filters),
  );
  const sorted = [...filtered].sort(compareBySort(filters.sort ?? 'relevance'));

  const pageSize = filters.pageSize ?? 12;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    products: sorted.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}
