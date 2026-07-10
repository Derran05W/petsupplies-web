import type { ServerCart } from '@/types/cart';
import { ApiError, apiFetch } from './client';

export interface CartApiOptions {
  accessToken?: string;
}

function authInit(
  options: CartApiOptions,
  init: RequestInit = {},
): RequestInit {
  const { accessToken } = options;
  return {
    cache: 'no-store',
    ...init,
    ...(accessToken ? { accessToken } : {}),
  };
}

export async function getCart(
  options: CartApiOptions = {},
): Promise<ServerCart> {
  return apiFetch<ServerCart>('/cart', authInit(options));
}

export async function addCartItem(
  productId: string,
  quantity: number,
  options: CartApiOptions = {},
): Promise<void> {
  await apiFetch<unknown>(
    '/cart/items',
    authInit(options, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  );
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number,
  options: CartApiOptions = {},
): Promise<void> {
  await apiFetch<unknown>(
    `/cart/items/${encodeURIComponent(cartItemId)}`,
    authInit(options, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    }),
  );
}

export async function removeCartItem(
  cartItemId: string,
  options: CartApiOptions = {},
): Promise<void> {
  await apiFetch<void>(
    `/cart/items/${encodeURIComponent(cartItemId)}`,
    authInit(options, { method: 'DELETE' }),
  );
}

export async function applyCartDiscount(
  code: string,
  options: CartApiOptions = {},
): Promise<ServerCart> {
  return apiFetch<ServerCart>(
    '/cart/discount',
    authInit(options, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  );
}

export async function removeCartDiscount(
  options: CartApiOptions = {},
): Promise<ServerCart> {
  const cart = await apiFetch<ServerCart>(
    '/cart/discount',
    authInit(options, { method: 'DELETE' }),
  );
  if (!cart || !Array.isArray(cart.items)) {
    throw new ApiError('Invalid response when removing discount', 0);
  }
  return cart;
}

export async function clearServerCart(
  options: CartApiOptions = {},
): Promise<void> {
  await apiFetch<void>('/cart', authInit(options, { method: 'DELETE' }));
}
