import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/subscription';
import { SUBSCRIPTION_STATUS_LABEL } from '@/types/subscription';

interface SubscriptionStatusPillProps {
  status: SubscriptionStatus;
  className?: string;
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'bg-brand-50 text-brand-800 ring-1 ring-brand-100',
  paused: 'bg-warm-100 text-warm-800 ring-1 ring-warm-200',
  canceled: 'bg-warm-200 text-warm-700 ring-1 ring-warm-300',
  past_due: 'bg-red-50 text-red-800 ring-1 ring-red-100',
  incomplete: 'bg-amber-50 text-amber-900 ring-1 ring-amber-100',
};

export function SubscriptionStatusPill({
  status,
  className,
}: SubscriptionStatusPillProps) {
  const label = SUBSCRIPTION_STATUS_LABEL[status];
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
