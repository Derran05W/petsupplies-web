import type { AdminDiscount, DiscountType } from '@/types/admin-discount';
import { formatPrice } from '@/lib/utils/format';

export function formatDiscountValue(type: DiscountType, value: number): string {
  switch (type) {
    case 'PERCENTAGE':
      return `${value}% off`;
    case 'FIXED':
      return `${formatPrice(value)} off`;
    case 'FREE_SHIPPING':
      return 'Free shipping';
    default:
      return String(value);
  }
}

export function formatDiscountTypeLabel(type: DiscountType): string {
  switch (type) {
    case 'PERCENTAGE':
      return 'Percentage';
    case 'FIXED':
      return 'Fixed amount';
    case 'FREE_SHIPPING':
      return 'Free shipping';
    default:
      return type;
  }
}

export function discountStatusLabel(discount: AdminDiscount): string {
  if (!discount.active) return 'Inactive';
  const now = Date.now();
  if (discount.validFrom && new Date(discount.validFrom).getTime() > now) {
    return 'Scheduled';
  }
  if (discount.validUntil && new Date(discount.validUntil).getTime() < now) {
    return 'Expired';
  }
  if (
    discount.maxRedemptions !== null &&
    discount.usedCount >= discount.maxRedemptions
  ) {
    return 'Maxed out';
  }
  return 'Active';
}

export function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function centsToDollarsInput(cents: number | null): string {
  if (cents === null) return '';
  return (cents / 100).toFixed(2);
}
