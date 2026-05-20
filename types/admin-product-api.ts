/**
 * Raw Phase 26 admin product shapes from petsupplies-api (Prisma-backed).
 * UI code should use `AdminProduct` in `types/admin.ts` after mapping.
 */

export const ADMIN_PRODUCT_CATEGORIES = [
  'DOG',
  'CAT',
  'FISH',
  'BIRD',
  'SMALL_PET',
  'REPTILE',
  'ACCESSORIES',
  'HEALTH',
] as const;

export type AdminProductCategory = (typeof ADMIN_PRODUCT_CATEGORIES)[number];

export const ADMIN_PRODUCT_CATEGORY_LABEL: Record<
  AdminProductCategory,
  string
> = {
  DOG: 'Dog',
  CAT: 'Cat',
  FISH: 'Fish',
  BIRD: 'Bird',
  SMALL_PET: 'Small pet',
  REPTILE: 'Reptile',
  ACCESSORIES: 'Accessories',
  HEALTH: 'Health',
};

export interface ApiAdminProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ApiAdminProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  category: AdminProductCategory;
  tags: string[];
  imageUrl: string | null;
  images: ApiAdminProductImage[];
  createdAt: string;
  updatedAt: string;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  shipsSeparately: boolean;
  subscriptionEligible: boolean;
  avgRating: number | null;
  reviewCount: number;
}

export interface ApiAdminProductListResponse {
  products: ApiAdminProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiAdminProductCreateBody {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock?: number;
  category: AdminProductCategory;
  active?: boolean;
  imageUrl?: string | null;
  tags?: string[];
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  shipsSeparately?: boolean;
}

export type ApiAdminProductUpdateBody = Partial<ApiAdminProductCreateBody>;

export interface ApiAdminProductDeleteResponse {
  deleted: 'soft' | 'hard';
}

export interface ApiProductImageUploadUrlResponse {
  uploadUrl: string;
  token: string;
  objectKey: string;
  publicUrl: string;
  maxBytes: number;
}

export interface ApiAdminAddImageBody {
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ApiAdminUpdateImageBody {
  url?: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}
