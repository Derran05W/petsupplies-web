import type { Address, AddressId } from '@/types/account';
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
    return await apiFetch<Address[]>(
      '/addresses',
      accessToken ? { cache: 'no-store', accessToken } : { cache: 'no-store' },
    );
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
  try {
    return await apiFetch<Address>(
      '/addresses',
      accessToken
        ? { method: 'POST', body: JSON.stringify(input), accessToken }
        : { method: 'POST', body: JSON.stringify(input) },
    );
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
  try {
    return await apiFetch<Address>(
      `/addresses/${encodeURIComponent(id)}`,
      accessToken
        ? { method: 'PATCH', body: JSON.stringify(input), accessToken }
        : { method: 'PATCH', body: JSON.stringify(input) },
    );
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
      `/addresses/${encodeURIComponent(id)}`,
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
    return await apiFetch<Address>(
      `/addresses/${encodeURIComponent(id)}/default`,
      accessToken ? { method: 'POST', accessToken } : { method: 'POST' },
    );
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
