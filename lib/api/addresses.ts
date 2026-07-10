import type { Address, AddressId } from '@/types/account';
import type { SupportedCountryCode } from '@/lib/checkout/schemas';
import type { AddressInput } from '@/lib/account/schemas';
import { apiFetch } from './client';

export type { AddressInput };

export interface AddressApiOptions {
  accessToken?: string;
}

/** Canonical mount point per src/app.ts (`/users/me/addresses`). */
const BASE = '/users/me/addresses';

/* -------------------------------------------------------------------------- */
/* Wire types + mappers. Backend `Address` uses `label` (not `fullName`) and   */
/* `region` (not `state`); country is `'CA'` only. The app `Address` type is   */
/* shared with checkout, so we translate here rather than reshaping it.        */
/* -------------------------------------------------------------------------- */

interface ApiAddress {
  id: string;
  userId?: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

function mapAddress(raw: unknown): Address {
  const a = raw as ApiAddress;
  return {
    id: a.id,
    // Backend has no recipient-name column; the app's `fullName` round-trips
    // through the optional `label` field.
    fullName: a.label ?? '',
    line1: a.line1,
    ...(a.line2 ? { line2: a.line2 } : {}),
    city: a.city,
    state: a.region,
    postalCode: a.postalCode,
    country: a.country as SupportedCountryCode,
    isDefault: a.isDefault,
    createdAt: a.createdAt,
  };
}

/** AddressInput (app fields) → backend create/patch body. */
function toAddressBody(input: AddressInput): Record<string, unknown> {
  return {
    label: input.fullName,
    line1: input.line1,
    ...(input.line2 && input.line2.length > 0 ? { line2: input.line2 } : {}),
    city: input.city,
    region: input.state,
    postalCode: input.postalCode,
    country: input.country,
    ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

/** GET `/users/me/addresses`. Returns the customer's saved addresses. */
export async function listAddresses(
  options: AddressApiOptions = {},
): Promise<Address[]> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown[]>(
    BASE,
    accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
  );
  return Array.isArray(raw) ? raw.map(mapAddress) : [];
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export async function createAddress(
  input: AddressInput,
  options: AddressApiOptions = {},
): Promise<Address> {
  const { accessToken } = options;
  const body = JSON.stringify(toAddressBody(input));
  const raw = await apiFetch<unknown>(
    BASE,
    accessToken
      ? { method: 'POST', body, accessToken }
      : { method: 'POST', body },
  );
  return mapAddress(raw);
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateAddress(
  id: AddressId,
  input: AddressInput,
  options: AddressApiOptions = {},
): Promise<Address> {
  const { accessToken } = options;
  const body = JSON.stringify(toAddressBody(input));
  const raw = await apiFetch<unknown>(
    `${BASE}/${encodeURIComponent(id)}`,
    accessToken
      ? { method: 'PATCH', body, accessToken }
      : { method: 'PATCH', body },
  );
  return mapAddress(raw);
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  await apiFetch<void>(
    `${BASE}/${encodeURIComponent(id)}`,
    accessToken ? { method: 'DELETE', accessToken } : { method: 'DELETE' },
  );
}

/* -------------------------------------------------------------------------- */
/* Set default                                                                */
/* -------------------------------------------------------------------------- */

export async function setDefaultAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<Address> {
  const { accessToken } = options;
  const raw = await apiFetch<unknown>(
    `${BASE}/${encodeURIComponent(id)}/default`,
    accessToken ? { method: 'POST', accessToken } : { method: 'POST' },
  );
  return mapAddress(raw);
}
