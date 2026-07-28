import type { ProductImage } from '@/types/product';
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductListResponse,
  StockState,
} from '@/types/admin';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/config';
import type {
  ApiAdminProduct,
  ApiAdminProductCreateBody,
  ApiAdminProductImage,
  ApiAdminProductListResponse,
  ApiAdminProductUpdateBody,
  AdminProductCategory,
} from '@/types/admin-product-api';

export function mapApiImage(image: ApiAdminProductImage): ProductImage {
  return {
    id: image.id,
    url: image.url,
    alt: image.altText?.trim() || 'Product image',
    isPrimary: image.isPrimary,
  };
}

export function mapApiProduct(product: ApiAdminProduct): AdminProduct {
  const images =
    product.images.length > 0
      ? product.images
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(mapApiImage)
      : product.imageUrl
        ? [
            {
              id: `legacy-${product.id}`,
              url: product.imageUrl,
              alt: product.name,
              isPrimary: true,
            },
          ]
        : [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceCents: product.price,
    category: product.category,
    categories:
      product.categories && product.categories.length > 0
        ? product.categories
        : [product.category],
    ingredients: product.ingredients ?? undefined,
    images,
    inStock: product.stock > 0,
    stockCount: product.stock,
    tags: product.tags ?? [],
    createdAt: product.createdAt,
    isPublished: product.active,
    imageUrl: product.imageUrl,
  };
}

export function mapApiListResponse(
  data: ApiAdminProductListResponse,
): AdminProductListResponse {
  const pageSize = data.limit;
  return {
    products: data.products.map(mapApiProduct),
    total: data.total,
    page: data.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(data.total / pageSize)),
  };
}

export function filterByStockState(
  products: AdminProduct[],
  stockState: StockState | undefined,
): AdminProduct[] {
  if (!stockState || stockState === 'all') return products;
  return products.filter((product) => {
    const isOut = product.stockCount <= 0;
    const isLow = !isOut && product.stockCount <= LOW_STOCK_THRESHOLD;
    if (stockState === 'out') return isOut;
    if (stockState === 'low') return isLow;
    if (stockState === 'in_stock') return !isOut && !isLow;
    return true;
  });
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function scalarProductFields(input: AdminProductInput) {
  const categories =
    input.categories && input.categories.length > 0
      ? input.categories
      : [input.category];
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: Math.trunc(input.priceCents),
    stock: Math.trunc(input.stockCount),
    // Send the authoritative list plus the primary for back-compat.
    category: categories[0]!,
    categories,
    ingredients: input.ingredients?.trim() ? input.ingredients.trim() : null,
    active: input.isPublished,
    tags: input.tags,
  };
}

function primaryImageUrl(input: AdminProductInput): string | null | undefined {
  const primaryUrl = input.images[0]?.url?.trim();
  if (!primaryUrl) return null;
  if (!isAbsoluteHttpUrl(primaryUrl)) return undefined;
  return primaryUrl;
}

export function toCreateBody(
  input: AdminProductInput,
): ApiAdminProductCreateBody {
  const body: ApiAdminProductCreateBody = {
    ...scalarProductFields(input),
  };
  const imageUrl = primaryImageUrl(input);
  if (imageUrl !== undefined) {
    body.imageUrl = imageUrl;
  }
  return body;
}

export function toUpdateBody(
  input: AdminProductInput,
): ApiAdminProductUpdateBody {
  const body: ApiAdminProductUpdateBody = {
    ...scalarProductFields(input),
  };
  const imageUrl = primaryImageUrl(input);
  if (imageUrl !== undefined) {
    body.imageUrl = imageUrl;
  }
  return body;
}

/** Client-generated image ids are not persisted server-side yet. */
export function isPersistedImageId(id: string): boolean {
  return !id.startsWith('img_') && !id.startsWith('legacy-');
}

export function categoryFromLegacy(
  category: string,
): AdminProductCategory | undefined {
  const upper = category.toUpperCase().replace(/-/g, '_');
  if (
    (
      [
        'DOG',
        'CAT',
        'FISH',
        'BIRD',
        'SMALL_PET',
        'REPTILE',
        'ACCESSORIES',
        'HEALTH',
      ] as const
    ).includes(upper as AdminProductCategory)
  ) {
    return upper as AdminProductCategory;
  }
  const legacyMap: Record<string, AdminProductCategory> = {
    food: 'DOG',
    treats: 'DOG',
    accessories: 'ACCESSORIES',
    healthcare: 'HEALTH',
    dog: 'DOG',
    cat: 'CAT',
    bird: 'BIRD',
    'small-animal': 'SMALL_PET',
  };
  return legacyMap[category.toLowerCase()];
}
