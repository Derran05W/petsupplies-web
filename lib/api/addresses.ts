import type { Address, AddressId } from '@/types/account';
import type { AddressInput } from '@/lib/account/schemas';
import { apiFetch } from './client';

export type { AddressInput };

export interface AddressApiOptions {
  accessToken?: string;
}

function fetchOpts(accessToken?: string, extra?: object) {
  return accessToken ? { ...extra, accessToken } : { ...extra };
}

export async function listAddresses(
  options: AddressApiOptions = {},
): Promise<Address[]> {
  return apiFetch<Address[]>('/addresses', {
    cache: 'no-store',
    ...fetchOpts(options.accessToken),
  });
}

export async function createAddress(
  input: AddressInput,
  options: AddressApiOptions = {},
): Promise<Address> {
  return apiFetch<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
    ...fetchOpts(options.accessToken),
  });
}

export async function updateAddress(
  id: AddressId,
  input: AddressInput,
  options: AddressApiOptions = {},
): Promise<Address> {
  return apiFetch<Address>(`/addresses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    ...fetchOpts(options.accessToken),
  });
}

export async function deleteAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<void> {
  await apiFetch<void>(`/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    ...fetchOpts(options.accessToken),
  });
}

export async function setDefaultAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<Address> {
  return apiFetch<Address>(`/addresses/${encodeURIComponent(id)}/default`, {
    method: 'POST',
    ...fetchOpts(options.accessToken),
  });
}
