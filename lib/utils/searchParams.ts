import {
  type Category,
  type PetType,
  type ProductFilters,
  type ProductSort,
} from '@/types/product';
import type { ReviewSort } from '@/types/review';

const VALID_CATEGORIES: ReadonlyArray<Category> = [
  'food',
  'treats',
  'accessories',
  'healthcare',
];

/**
 * Pet types shoppers can filter by. Fish and bird products are no longer
 * carried — their `?petType=` values are dropped like any other invalid
 * param, so old links render the default listing instead of an empty shelf.
 */
const VALID_PET_TYPES: ReadonlyArray<PetType> = [
  'dog',
  'cat',
  'reptile',
  'small-animal',
];

/** Nav links often use `?category=CAT` (API enum) instead of `?petType=cat`. */
const API_PET_CATEGORY_PARAM: Readonly<Record<string, PetType>> = {
  dog: 'dog',
  cat: 'cat',
  reptile: 'reptile',
  small_pet: 'small-animal',
};

/** API shelf enums mapped to storefront category slugs. */
const API_SHELF_CATEGORY_PARAM: Readonly<Record<string, Category>> = {
  accessories: 'accessories',
  health: 'healthcare',
};

const PRODUCT_LISTING_KEYS = [
  'category',
  'petType',
  'search',
  'sort',
  'minPrice',
  'maxPrice',
  'page',
] as const;

function normalizeCategoryQueryParam(raw: string): {
  category?: Category;
  petType?: PetType;
} {
  const lower = raw.toLowerCase();
  if ((VALID_CATEGORIES as readonly string[]).includes(lower)) {
    return { category: lower as Category };
  }

  const petKey = lower.replace(/-/g, '_');
  const petType = API_PET_CATEGORY_PARAM[petKey];
  if (petType) return { petType };

  const shelf = API_SHELF_CATEGORY_PARAM[petKey];
  if (shelf) return { category: shelf };

  return {};
}

const VALID_SORTS: ReadonlyArray<ProductSort> = [
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
];

const VALID_REVIEW_SORTS: ReadonlyArray<ReviewSort> = [
  'newest',
  'oldest',
  'rating_desc',
  'rating_asc',
];

/** Pre-contract URL values; mapped to API sort on read. */
const LEGACY_REVIEW_SORT: Readonly<Record<string, ReviewSort>> = {
  recent: 'newest',
  helpful: 'newest',
};

function parseReviewSort(raw: string | undefined): ReviewSort {
  if (raw && (VALID_REVIEW_SORTS as readonly string[]).includes(raw)) {
    return raw as ReviewSort;
  }
  if (raw && raw in LEGACY_REVIEW_SORT) {
    return LEGACY_REVIEW_SORT[raw]!;
  }
  return 'newest';
}

/**
 * Pull a single string value out of a Next.js `searchParams` page prop.
 * Arrays (`?a=1&a=2`) collapse to the first entry. Empty / undefined
 * values come back as `undefined`.
 */
export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' && first.length > 0 ? first : undefined;
  }
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

function parseIntOrUndefined(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parsePriceCents(value: string | undefined): number | undefined {
  if (!value) return undefined;
  // Accept either "1500" (cents) or "15" / "15.00" (dollars). Filter inputs
  // submit dollar amounts; backend stores cents.
  const asNumber = Number.parseFloat(value);
  if (!Number.isFinite(asNumber) || asNumber < 0) return undefined;
  return Math.round(asNumber * 100);
}

/**
 * Validate and coerce a Next.js `searchParams` object into a typed
 * `ProductFilters` object. Anything invalid is dropped silently — this
 * way, malformed query strings render the default listing rather than
 * 500-ing.
 */
export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProductFilters {
  const categoryParam = firstParam(searchParams['category']);
  const petTypeParam = firstParam(searchParams['petType']);
  const sort = firstParam(searchParams['sort']);

  const filters: ProductFilters = {};

  if (
    petTypeParam &&
    (VALID_PET_TYPES as readonly string[]).includes(petTypeParam)
  ) {
    filters.petType = petTypeParam as PetType;
  } else if (categoryParam) {
    // Category is a comma-separated multi-select list. Each token is
    // normalized independently; a token that resolves to a pet type (legacy
    // nav links like `?category=CAT`) still sets `petType`.
    const categories: Category[] = [];
    for (const token of categoryParam.split(',')) {
      const trimmed = token.trim();
      if (trimmed.length === 0) continue;
      const fromCategory = normalizeCategoryQueryParam(trimmed);
      if (
        fromCategory.category &&
        !categories.includes(fromCategory.category)
      ) {
        categories.push(fromCategory.category);
      }
      if (fromCategory.petType) filters.petType = fromCategory.petType;
    }
    if (categories.length > 0) filters.categories = categories;
  }

  if (sort && (VALID_SORTS as readonly string[]).includes(sort)) {
    filters.sort = sort as ProductSort;
  }

  const minPrice = parsePriceCents(firstParam(searchParams['minPrice']));
  if (typeof minPrice === 'number') filters.minPriceCents = minPrice;

  const maxPrice = parsePriceCents(firstParam(searchParams['maxPrice']));
  if (typeof maxPrice === 'number') filters.maxPriceCents = maxPrice;

  const search = firstParam(searchParams['search']);
  if (search) filters.search = search;

  const page = parseIntOrUndefined(firstParam(searchParams['page']));
  if (typeof page === 'number' && page >= 1) filters.page = page;

  return filters;
}

/** Canonical `/products` query string from parsed filters + raw price/page params. */
export function buildProductListingSearchParams(
  filters: ProductFilters,
  searchParams: Record<string, string | string[] | undefined> = {},
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.petType) params.set('petType', filters.petType);
  if (filters.categories && filters.categories.length > 0) {
    params.set('category', filters.categories.join(','));
  }
  if (filters.search) params.set('search', filters.search);
  if (filters.sort && filters.sort !== 'relevance') {
    params.set('sort', filters.sort);
  }

  for (const key of ['minPrice', 'maxPrice', 'page'] as const) {
    const value = firstParam(searchParams[key]);
    if (value) params.set(key, value);
  }

  return params;
}

function serializeProductListingSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();
  for (const key of PRODUCT_LISTING_KEYS) {
    const value = firstParam(searchParams[key]);
    if (value) params.set(key, value);
  }
  return params.toString();
}

/**
 * Rewrite legacy nav URLs such as `/products?category=CAT` to
 * `/products?petType=cat` so filter checkboxes and fetches stay in sync.
 */
export function legacyProductListingRedirectPath(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const canonical = buildProductListingSearchParams(
    parseProductFilters(searchParams),
    searchParams,
  );
  const raw = serializeProductListingSearchParams(searchParams);
  const canon = canonical.toString();
  if (raw === canon) return null;
  return canon.length > 0 ? `/products?${canon}` : '/products';
}

/**
 * How many filters/search inputs are currently active. Used by the mobile
 * "Filters" trigger to render a count badge.
 */
export function activeFilterCount(filters: ProductFilters): number {
  let n = 0;
  if (filters.categories && filters.categories.length > 0) n += 1;
  if (filters.petType) n += 1;
  if (typeof filters.minPriceCents === 'number') n += 1;
  if (typeof filters.maxPriceCents === 'number') n += 1;
  if (filters.search && filters.search.length > 0) n += 1;
  return n;
}

export interface ReviewListingParams {
  page: number;
  sort: ReviewSort;
}

/**
 * PDP customer reviews pagination/sort query (`reviewsPage`, `reviewsSort`).
 */
export function parseReviewListingParams(
  searchParams: Record<string, string | string[] | undefined>,
): ReviewListingParams {
  const pageRaw = firstParam(searchParams['reviewsPage']);
  let page = Number.parseInt(pageRaw ?? '1', 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  const sort = parseReviewSort(firstParam(searchParams['reviewsSort']));

  return { page, sort };
}

/** Clamp review list page to [1, totalPages] after the API responds. */
export function clampReviewPage(page: number, totalPages: number): number {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}
