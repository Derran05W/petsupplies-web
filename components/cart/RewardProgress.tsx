'use client';

import { Gift } from 'lucide-react';
import { useRewardsProgress } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface RewardProgressProps {
  /**
   * `compact` is used inside the cart drawer header — a thin bar with a
   * single line of microcopy, matching `FreeShippingProgress`. The full
   * variant (product page + cart summary) adds a milestone track with a
   * gift node per tier, each labelled below.
   */
  compact?: boolean;
  className?: string;
}

/**
 * Node caption: the spend threshold ("Any purchase" / "Spend $49") plus the
 * configured reward label ("Get a sample").
 */
function thresholdCaption(thresholdCents: number): string {
  return thresholdCents <= 0
    ? 'Any purchase'
    : `Spend ${formatPrice(thresholdCents)}`;
}

export function RewardProgress({
  compact = false,
  className,
}: RewardProgressProps) {
  const {
    tiers,
    subtotalCents,
    nextTier,
    remainingToNextCents,
    unlockedCount,
    progress,
  } = useRewardsProgress();

  // Feature off — no tiers configured.
  if (tiers.length === 0) return null;

  const allUnlocked = unlockedCount >= tiers.length;

  let microcopy: string;
  if (allUnlocked) {
    microcopy = 'All gifts unlocked';
  } else if (unlockedCount === 0) {
    microcopy = `Spend ${formatPrice(remainingToNextCents)} more to unlock a free gift`;
  } else {
    const lastUnlocked = tiers[unlockedCount - 1]!;
    microcopy = `You've unlocked ${lastUnlocked.label}! Spend ${formatPrice(
      remainingToNextCents,
    )} more for ${nextTier?.label ?? 'the next gift'}`;
  }

  const ariaNow = Math.round(progress * 100);

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <p className="inline-flex items-center gap-1.5 font-body text-xs text-ink-muted">
          <Gift size={12} aria-hidden className="text-pine" />
          <span>{microcopy}</span>
        </p>
        <div
          className="h-1 w-full overflow-hidden rounded-pill bg-line"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ariaNow}
          aria-label="Gift rewards progress"
        >
          <div
            className="h-full rounded-pill bg-pine transition-all duration-slow ease-soft"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // Nodes are spaced evenly along the track (segment centers) rather than
  // proportionally to their dollar value — admin-chosen thresholds can sit
  // arbitrarily close together, and proportional placement would collide
  // nodes and captions. The fill interpolates piecewise between node
  // positions so it still lands exactly on a node at its threshold.
  const nodePct = (index: number) => ((index + 0.5) / tiers.length) * 100;

  let trackPct: number;
  if (subtotalCents >= tiers[tiers.length - 1]!.thresholdCents) {
    trackPct = 100;
  } else {
    const nextIndex = tiers.findIndex(
      (tier) => tier.thresholdCents > subtotalCents,
    );
    const prevCents =
      nextIndex === 0 ? 0 : tiers[nextIndex - 1]!.thresholdCents;
    const prevPct = nextIndex === 0 ? 0 : nodePct(nextIndex - 1);
    const span = tiers[nextIndex]!.thresholdCents - prevCents;
    const frac = span <= 0 ? 1 : (subtotalCents - prevCents) / span;
    trackPct = prevPct + frac * (nodePct(nextIndex) - prevPct);
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <p className="inline-flex items-center gap-2 font-body text-sm text-ink">
        <Gift size={14} aria-hidden className="text-pine" />
        <span>{microcopy}</span>
      </p>

      <div
        className="px-2 pb-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(trackPct)}
        aria-label="Gift rewards progress"
      >
        {/* Milestone track: hairline rail, pine fill, a gift node per tier. */}
        <div className="relative h-2">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-pill bg-line" />
          <div
            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-pill bg-pine transition-all duration-slow ease-soft"
            style={{ width: `${trackPct}%` }}
          />
          {tiers.map((tier, index) => {
            const unlocked = subtotalCents >= tier.thresholdCents;
            return (
              <div
                key={`${tier.thresholdCents}-${index}`}
                className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${nodePct(index)}%` }}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full border transition-colors duration-base ease-soft',
                    unlocked
                      ? 'border-pine bg-pine text-paper'
                      : 'border-line bg-paper text-ink-muted',
                  )}
                >
                  <Gift size={12} aria-hidden />
                </span>
              </div>
            );
          })}
        </div>

        {/* Captions in equal columns, centered under their evenly spaced
            nodes — cannot overlap no matter how close the thresholds are. */}
        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${tiers.length}, 1fr)` }}
        >
          {tiers.map((tier, index) => {
            const unlocked = subtotalCents >= tier.thresholdCents;
            return (
              <div
                key={`${tier.thresholdCents}-${index}-caption`}
                className="flex flex-col items-center gap-0.5 text-center"
              >
                <span
                  className={cn(
                    'font-body text-micro uppercase',
                    unlocked ? 'text-ink' : 'text-ink-muted',
                  )}
                >
                  {thresholdCaption(tier.thresholdCents)}
                </span>
                <span className="font-body text-micro text-ink-faint">
                  {tier.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
