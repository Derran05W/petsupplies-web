import type { ProductSubscriptionInfo } from './subscription';

/**
 * Product types — mirrors the petsupplies-api Prisma schema for Phase 4.
 * Backend Phase 4 will expose `/products` and `/products/:slug` endpoints
 * shaped exactly like these interfaces; the frontend can therefore consume
 * the response with no transformation layer.
 */

export type PetType = 'dog' | 'cat' | 'bird' | 'small-animal';

export type Category = 'food' | 'treats' | 'accessories' | 'healthcare';

export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface GuaranteedAnalysisRow {
  nutrient: string;
  percentage: string;
}

export interface NutritionalInfo {
  ingredients: string;
  guaranteedAnalysis: GuaranteedAnalysisRow[];
  feedingGuidelines: string;
}

export interface Rating {
  avg: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number;
  category: Category;
  petType: PetType;
  images: ProductImage[];
  nutritionalInfo?: NutritionalInfo;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  rating?: Rating;
  createdAt: string;
  /** Subscribe & Save eligibility + cadences (omit when unavailable). */
  subscription?: ProductSubscriptionInfo;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: Category;
  petType?: PetType;
  minPriceCents?: number;
  maxPriceCents?: number;
  search?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

/**
 * Display-friendly labels for category and pet type values. Frontend-only
 * (the backend stores the slug values above). Imported by filter UIs and
 * ProductCard to render human-readable strings.
 */
export const PET_TYPE_LABEL: Record<PetType, string> = {
  dog: 'Dogs',
  cat: 'Cats',
  bird: 'Birds',
  'small-animal': 'Small animals',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  food: 'Food',
  treats: 'Treats',
  accessories: 'Accessories',
  healthcare: 'Healthcare',
};

export const SORT_LABEL: Record<ProductSort, string> = {
  relevance: 'Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  newest: 'Newest',
};
