import {
  type Category,
  type PetType,
  type ProductFilters,
  type ProductSort,
} from '@/types/product';

const VALID_CATEGORIES: ReadonlyArray<Category> = [
  'food',
  'treats',
  'accessories',
  'healthcare',
];

const VALID_PET_TYPES: ReadonlyArray<PetType> = [
  'dog',
  'cat',
  'bird',
  'small-animal',
];

const VALID_SORTS: ReadonlyArray<ProductSort> = [
  'relevance',
  'price_asc',
  'price_desc',
  'newest',
];

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
  const category = firstParam(searchParams['category']);
  const petType = firstParam(searchParams['petType']);
  const sort = firstParam(searchParams['sort']);

  const filters: ProductFilters = {};

  if (category && (VALID_CATEGORIES as readonly string[]).includes(category)) {
    filters.category = category as Category;
  }
  if (petType && (VALID_PET_TYPES as readonly string[]).includes(petType)) {
    filters.petType = petType as PetType;
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

/**
 * How many filters/search inputs are currently active. Used by the mobile
 * "Filters" trigger to render a count badge.
 */
export function activeFilterCount(filters: ProductFilters): number {
  let n = 0;
  if (filters.category) n += 1;
  if (filters.petType) n += 1;
  if (typeof filters.minPriceCents === 'number') n += 1;
  if (typeof filters.maxPriceCents === 'number') n += 1;
  if (filters.search && filters.search.length > 0) n += 1;
  return n;
}
