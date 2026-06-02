import type { DiscountRejectReason } from '@/types/cart';

const MESSAGES: Record<DiscountRejectReason, string> = {
  INVALID_FORMAT: 'Enter a valid discount code.',
  NOT_FOUND: 'That code is not valid.',
  INACTIVE: 'That code is no longer active.',
  NOT_STARTED: 'That code is not active yet.',
  EXPIRED: 'That code has expired.',
  MIN_CART_NOT_MET: 'Your cart does not meet the minimum for this code.',
  MAX_REDEMPTIONS_REACHED: 'That code has reached its usage limit.',
  ALREADY_USED: 'You have already used this code.',
};

export function discountRejectMessage(reason: DiscountRejectReason): string {
  return MESSAGES[reason] ?? 'That discount code could not be applied.';
}
