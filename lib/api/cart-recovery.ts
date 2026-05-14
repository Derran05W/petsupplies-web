import type { CartLine } from '@/lib/store/cart';
import { apiFetch } from './client';

export interface CartRecoveryResponse {
  lines: CartLine[];
  redirectToCheckout?: boolean;
}

export async function getCartRecoveryByToken(
  token: string,
): Promise<CartRecoveryResponse> {
  const params = new URLSearchParams({ token });
  return apiFetch<CartRecoveryResponse>(
    `/email/cart-recovery?${params.toString()}`,
    { cache: 'no-store' },
  );
}
