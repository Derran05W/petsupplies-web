import type { Category, PetType } from '@/types/product';

export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export type DiscountRejectReason =
  | 'INVALID_FORMAT'
  | 'NOT_FOUND'
  | 'INACTIVE'
  | 'NOT_STARTED'
  | 'EXPIRED'
  | 'MIN_CART_NOT_MET'
  | 'MAX_REDEMPTIONS_REACHED'
  | 'ALREADY_USED';

/** Raw cart item row from petsupplies-api `GET /cart`. */
export interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    active: boolean;
  };
}

/** Normalised server cart from petsupplies-api. */
export interface ServerCart {
  id: string;
  items: ApiCartItem[];
  subtotalCents: number;
  appliedDiscountCents: number;
  shippingCents: number;
  shippingDiscountCents: number;
  totalCents: number;
  discountCode?: string;
  discountType?: DiscountType;
  discountValue?: number;
  freeShippingThresholdCents: number;
  freeShippingRemainingCents: number;
  discountInvalidReason?: DiscountRejectReason;
  discountInvalidCode?: string;
}

/**
 * Unified cart line for UI — guest (Zustand) and signed-in (server) modes.
 * `cartItemId` is set for server lines (PATCH/DELETE /cart/items/:id).
 */
export interface CartViewLine {
  cartItemId?: string;
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  category?: Category;
  petType?: PetType;
  stockCount: number;
  quantity: number;
  addedAt?: string;
}

export interface CartTotals {
  subtotalCents: number;
  appliedDiscountCents: number;
  shippingCents: number;
  totalCents: number;
  discountCode?: string;
  discountType?: DiscountType;
  freeShippingThresholdCents: number;
  freeShippingRemainingCents: number;
  discountInvalidReason?: DiscountRejectReason;
  discountInvalidCode?: string;
}
