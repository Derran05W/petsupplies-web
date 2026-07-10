import { BadgeCheck } from 'lucide-react';

export function VerifiedPurchaseBadge() {
  return (
    <span className="border-pine/40 inline-flex items-center gap-1 rounded-tag border bg-tile-sage px-2 py-0.5 font-body text-micro uppercase text-tile-sage-ink">
      <BadgeCheck size={12} aria-hidden className="text-pine" />
      Verified purchase
    </span>
  );
}
