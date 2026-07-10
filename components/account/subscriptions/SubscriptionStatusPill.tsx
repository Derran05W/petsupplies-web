import { cn } from '@/lib/utils';
import type { SubscriptionStatus } from '@/types/subscription';
import { SUBSCRIPTION_STATUS_LABEL } from '@/types/subscription';

interface SubscriptionStatusPillProps {
  status: SubscriptionStatus;
  className?: string;
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'border-pine/40 bg-tile-sage text-tile-sage-ink',
  paused: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
  canceled: 'border-line bg-panel text-ink-muted',
  past_due: 'border-danger-border bg-danger-surface text-danger-solid',
  incomplete: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
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
        'inline-flex items-center rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
        STATUS_STYLES[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
