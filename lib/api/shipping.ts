import type {
  CanadianShippingDestination,
  ShippingQuoteResponse,
} from '@/types/shipping';
import { ApiError, apiFetch } from './client';

export interface ShippingApiOptions {
  accessToken?: string;
}

export type ShippingQuoteBody =
  | { addressId: string }
  | CanadianShippingDestination;

export async function quoteShipping(
  body: ShippingQuoteBody,
  options: ShippingApiOptions = {},
): Promise<ShippingQuoteResponse> {
  const { accessToken } = options;
  return apiFetch<ShippingQuoteResponse>('/shipping/quote', {
    method: 'POST',
    body: JSON.stringify(body),
    cache: 'no-store',
    ...(accessToken ? { accessToken } : {}),
  });
}

export function isShippingRateStaleError(err: unknown): boolean {
  return (
    err instanceof ApiError &&
    err.status === 409 &&
    /SHIPPING_RATE_STALE|shipping.*stale/i.test(err.message)
  );
}
