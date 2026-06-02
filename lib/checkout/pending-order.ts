const STORAGE_KEY = 'pawsupply-pending-order-id';

export function savePendingOrderId(orderId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, orderId);
}

export function loadPendingOrderId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearPendingOrderId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
