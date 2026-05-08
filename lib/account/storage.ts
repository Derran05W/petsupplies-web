/**
 * localStorage helpers for the dev addresses fallback. Mirrors
 * `lib/checkout/storage.ts` in shape — only the scope differs:
 *   - checkout snapshot is per-tab (sessionStorage)
 *   - saved addresses must survive a tab close (localStorage)
 *
 * When the backend Phase 8 endpoints land, the entire `lib/api/addresses.ts`
 * fallback path goes away and this module can be deleted.
 *
 * TODO(phase 7): remove once backend phase 8 is on staging.
 */
import type { Address } from '@/types/account';

const STORAGE_KEY = 'pawsupply-addresses-dev-v1';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStoredAddresses(): Address[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Address[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredAddresses(addresses: Address[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {
    // Quota exceeded — fallback to in-memory only; the user's CRUD will
    // still appear to work in this tab.
  }
}
