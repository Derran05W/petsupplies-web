export type ShippingQuoteSource = 'canada_post' | 'fallback';

export type ShippingCarrier = 'CANADA_POST' | 'FLAT';

export interface ShippingRateOption {
  serviceCode: string;
  serviceName: string;
  carrier: ShippingCarrier;
  amountCents: number;
  estimatedDeliveryDays?: number;
  selectionToken: string;
}

export interface ShippingQuoteResponse {
  source: ShippingQuoteSource;
  options: ShippingRateOption[];
  expiresAt: string;
}

/** Inline Canadian destination for quote + checkout selection. */
export interface CanadianShippingDestination {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'CA';
}

export interface ShippingSelectionInput {
  selectionToken: string;
  serviceCode: string;
  amountCents: number;
  addressId?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: 'CA';
}
