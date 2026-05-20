export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export type AdminDiscount = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minCartCents: number | null;
  maxRedemptions: number | null;
  usedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  active: boolean;
  stripeCouponId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDiscountListResponse = {
  data: AdminDiscount[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminDiscountCreateInput = {
  code: string;
  type: DiscountType;
  value: number;
  minCartCents?: number | null;
  maxRedemptions?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  active?: boolean;
};

export type AdminDiscountUpdateInput = {
  value?: number;
  minCartCents?: number | null;
  maxRedemptions?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  active?: boolean;
};
