import type { Address, AddressId } from '@/types/account';
import type { SupportedCountryCode } from '@/lib/checkout/schemas';
import type { AddressInput } from '@/lib/account/schemas';
import { ApiError, apiFetch } from './client';
import {
  loadStoredAddresses,
  saveStoredAddresses,
} from '@/lib/account/storage';

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

let warnedAboutAddressesFallback = false;

function warnFallback(): void {
  if (warnedAboutAddressesFallback) return;
  warnedAboutAddressesFallback = true;
  // eslint-disable-next-line no-console
  console.warn('[addresses] backend unreachable — using localStorage for dev');
}

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * GET `/addresses`. Returns the customer's saved addresses.
 *
 * **Backend-not-ready fallback:** read from localStorage. Marked
 * everywhere with `// TODO(phase 7): remove fallback once backend phase
 * 8 is on staging`.
 */
export async function listAddresses(
  options: AddressApiOptions = {},
): Promise<Address[]> {
  const { accessToken } = options;
  try {
    const raw = await apiFetch<unknown[]>(
      BASE,
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
    return Array.isArray(raw) ? raw.map(mapAddress) : [];
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      return loadStoredAddresses();
    }
    throw err;
  }
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
  try {
    const raw = await apiFetch<unknown>(
      BASE,
      accessToken
        ? { method: 'POST', body, accessToken }
        : { method: 'POST', body },
    );
    return mapAddress(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const existing = loadStoredAddresses();
      const wantsDefault = input.isDefault === true || existing.length === 0;
      const created: Address = {
        id: `addr_dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        fullName: input.fullName,
        line1: input.line1,
        ...(input.line2 && input.line2.length > 0
          ? { line2: input.line2 }
          : {}),
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: wantsDefault,
        createdAt: new Date().toISOString(),
      };
      const next = wantsDefault
        ? existing.map((addr) => ({ ...addr, isDefault: false }))
        : existing;
      const updated = [...next, created];
      saveStoredAddresses(updated);
      return created;
    }
    throw err;
  }
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
  try {
    const raw = await apiFetch<unknown>(
      `${BASE}/${encodeURIComponent(id)}`,
      accessToken
        ? { method: 'PATCH', body, accessToken }
        : { method: 'PATCH', body },
    );
    return mapAddress(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const existing = loadStoredAddresses();
      const target = existing.find((addr) => addr.id === id);
      if (!target) throw new ApiError('Address not found', 404);
      const willBeDefault = input.isDefault === true || target.isDefault;
      const updated: Address = {
        ...target,
        fullName: input.fullName,
        line1: input.line1,
        ...(input.line2 && input.line2.length > 0
          ? { line2: input.line2 }
          : { line2: undefined }),
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: willBeDefault,
      };
      const next = existing.map((addr) => {
        if (addr.id === id) return updated;
        if (willBeDefault) return { ...addr, isDefault: false };
        return addr;
      });
      saveStoredAddresses(next);
      return updated;
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<void> {
  const { accessToken } = options;
  try {
    await apiFetch<void>(
      `${BASE}/${encodeURIComponent(id)}`,
      accessToken ? { method: 'DELETE', accessToken } : { method: 'DELETE' },
    );
    return;
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const existing = loadStoredAddresses();
      const target = existing.find((addr) => addr.id === id);
      const remaining = existing.filter((addr) => addr.id !== id);
      // If we just removed the default, promote the most recently
      // created remaining address so the card grid never sits without a
      // default once the customer has at least one entry.
      if (target?.isDefault && remaining.length > 0) {
        const sorted = [...remaining].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const promoted = sorted[0];
        if (promoted) {
          for (let i = 0; i < remaining.length; i += 1) {
            const entry = remaining[i];
            if (entry && entry.id === promoted.id) {
              remaining[i] = { ...entry, isDefault: true };
            } else if (entry) {
              remaining[i] = { ...entry, isDefault: false };
            }
          }
        }
      }
      saveStoredAddresses(remaining);
      return;
    }
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* Set default                                                                */
/* -------------------------------------------------------------------------- */

export async function setDefaultAddress(
  id: AddressId,
  options: AddressApiOptions = {},
): Promise<Address> {
  const { accessToken } = options;
  try {
    const raw = await apiFetch<unknown>(
      `${BASE}/${encodeURIComponent(id)}/default`,
      accessToken ? { method: 'POST', accessToken } : { method: 'POST' },
    );
    return mapAddress(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnFallback();
      const existing = loadStoredAddresses();
      const target = existing.find((addr) => addr.id === id);
      if (!target) throw new ApiError('Address not found', 404);
      const next = existing.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      saveStoredAddresses(next);
      return { ...target, isDefault: true };
    }
    throw err;
  }
}
