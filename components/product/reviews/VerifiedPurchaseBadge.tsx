import { BadgeCheck } from 'lucide-react';

export function VerifiedPurchaseBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 font-body text-xs font-medium text-brand-700">
      <BadgeCheck size={12} aria-hidden className="text-brand-600" />
      Verified purchase
    </span>
  );
}
