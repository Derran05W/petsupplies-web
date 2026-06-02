import type {
  Category,
  PetType,
  Product,
  ProductImage,
  ProductListResponse,
} from '@/types/product';

/** Raw product row from petsupplies-api catalog routes (Prisma-shaped). */
export interface ApiCatalogProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ApiCatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  active: boolean;
  category: string;
  tags: string[];
  images?: ApiCatalogProductImage[];
  inStock?: boolean;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
  subscriptionEligible?: boolean;
}

export interface ApiCatalogProductListResponse {
  products: ApiCatalogProduct[];
  total: number;
  page: number;
  limit: number;
}

const API_CATEGORY_TO_STOREFRONT: Record<string, Category> = {
  ACCESSORIES: 'accessories',
  HEALTH: 'healthcare',
  DOG: 'food',
  CAT: 'food',
  FISH: 'food',
  BIRD: 'food',
  SMALL_PET: 'food',
  REPTILE: 'food',
};

function mapApiImage(image: ApiCatalogProductImage): ProductImage {
  return {
    id: image.id,
    url: image.url,
    alt: image.altText?.trim() || 'Product image',
    isPrimary: image.isPrimary,
  };
}

function inferPetType(tags: string[], apiCategory: string): PetType {
  const joined = tags.map((t) => t.toLowerCase()).join(' ');
  if (joined.includes('dog')) return 'dog';
  if (joined.includes('cat')) return 'cat';
  if (joined.includes('bird')) return 'bird';
  if (joined.includes('fish')) return 'fish';
  if (joined.includes('reptile')) return 'reptile';
  if (
    joined.includes('small-animal') ||
    joined.includes('hamster') ||
    joined.includes('rabbit')
  ) {
    return 'small-animal';
  }
  switch (apiCategory.toUpperCase()) {
    case 'DOG':
      return 'dog';
    case 'CAT':
      return 'cat';
    case 'BIRD':
      return 'bird';
    case 'FISH':
      return 'fish';
    case 'REPTILE':
      return 'reptile';
    case 'SMALL_PET':
      return 'small-animal';
    default:
      return 'dog';
  }
}

function mapStorefrontCategory(tags: string[], apiCategory: string): Category {
  const joined = tags.map((t) => t.toLowerCase()).join(' ');
  if (joined.includes('treat')) return 'treats';
  if (joined.includes('accessor')) return 'accessories';
  if (joined.includes('health') || joined.includes('care')) return 'healthcare';
  return API_CATEGORY_TO_STOREFRONT[apiCategory.toUpperCase()] ?? 'food';
}

function isNormalizedProduct(raw: unknown): raw is Product {
  return (
    !!raw &&
    typeof raw === 'object' &&
    'priceCents' in raw &&
    typeof (raw as Product).priceCents === 'number' &&
    Number.isFinite((raw as Product).priceCents)
  );
}

function coercePriceCents(raw: Record<string, unknown>): number {
  for (const key of ['priceCents', 'price'] as const) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.round(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) continue;
      const parsed = Number.parseFloat(trimmed);
      if (Number.isFinite(parsed)) return Math.round(parsed);
    }
  }
  return 0;
}

/** Map petsupplies-api catalog product → storefront `Product`. */
export function mapCatalogProduct(raw: unknown): Product {
  if (isNormalizedProduct(raw)) {
    return raw;
  }

  const p = raw as ApiCatalogProduct;
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const images =
    p.images && p.images.length > 0
      ? [...p.images].sort((a, b) => a.sortOrder - b.sortOrder).map(mapApiImage)
      : p.imageUrl
        ? [
            {
              id: `legacy-${p.id}`,
              url: p.imageUrl,
              alt: p.name,
              isPrimary: true,
            },
          ]
        : [];

  const stockCount = typeof p.stock === 'number' ? p.stock : 0;
  const inStock = typeof p.inStock === 'boolean' ? p.inStock : stockCount > 0;

  const reviewCount = typeof p.reviewCount === 'number' ? p.reviewCount : 0;
  const avgRating = p.avgRating;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCents: coercePriceCents(p as unknown as Record<string, unknown>),
    category: mapStorefrontCategory(tags, p.category ?? ''),
    petType: inferPetType(tags, p.category ?? ''),
    images,
    inStock,
    stockCount,
    tags,
    rating:
      typeof avgRating === 'number' && reviewCount > 0
        ? { avg: avgRating, count: reviewCount }
        : undefined,
    createdAt: p.createdAt,
    ...(p.subscriptionEligible
      ? {
          subscription: {
            enabled: true,
            discountPercent: 5,
            intervals: ['4_weeks', '8_weeks', '12_weeks'],
          },
        }
      : {}),
  };
}

export function mapCatalogProductListResponse(
  raw: ApiCatalogProductListResponse,
): ProductListResponse {
  const pageSize = raw.limit ?? 12;
  const total = raw.total ?? 0;
  const page = raw.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    products: (raw.products ?? []).map(mapCatalogProduct),
    total,
    page,
    pageSize,
    totalPages,
  };
}
