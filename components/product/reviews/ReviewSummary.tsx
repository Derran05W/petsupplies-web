import type { Rating as ProductRating } from '@/types/product';
import type { RatingBreakdown, ReviewSummaryStats } from '@/types/review';
import { RatingStars } from './RatingStars';

interface ReviewSummaryProps {
  summary?: ReviewSummaryStats;
  productRating?: ProductRating;
  /** Total rows returned by the reviews list API (may be 0). */
  listTotal: number;
}

function BreakdownBars({ breakdown }: { breakdown: RatingBreakdown }) {
  const counts = [1, 2, 3, 4, 5].map(
    (n) => breakdown[String(n) as keyof RatingBreakdown] ?? 0,
  );
  const totalResponses = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="mt-6 space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = breakdown[String(stars) as keyof RatingBreakdown] ?? 0;
        const pct =
          totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        return (
          <div
            key={stars}
            className="flex items-center gap-3 font-body text-xs text-ink-muted"
          >
            <span className="w-14 shrink-0">{stars} stars</span>
            <div className="bg-ink/10 h-2 min-w-0 flex-1 overflow-hidden rounded-pill">
              <div
                className="h-full rounded-pill bg-amber transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right tabular-nums text-ink-faint">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewSummary({
  summary,
  productRating,
  listTotal,
}: ReviewSummaryProps) {
  const avg = summary?.avg ?? productRating?.avg ?? null;
  const count =
    summary?.count ??
    productRating?.count ??
    (listTotal > 0 ? listTotal : null);

  const showBreakdown =
    summary?.breakdown &&
    Object.values(summary.breakdown).some(
      (n) => typeof n === 'number' && n > 0,
    );

  return (
    <div className="rounded-card border border-line bg-panel p-6">
      <div className="flex flex-wrap items-start gap-6">
        <div>
          <p className="font-body text-micro uppercase text-ink-muted">
            Overall rating
          </p>
          {avg !== null && count !== null ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="font-display text-4xl tracking-[-0.02em] text-ink">
                {avg.toFixed(1)}
              </span>
              <div className="flex flex-col gap-1">
                <RatingStars variant="full" value={Math.round(avg)} size={18} />
                <span className="font-body text-sm text-ink-muted">
                  Based on {count} {count === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-2 font-body text-sm text-ink-secondary">
              No ratings yet — be the first to review.
            </p>
          )}
        </div>
      </div>
      {showBreakdown ? <BreakdownBars breakdown={summary!.breakdown!} /> : null}
    </div>
  );
}
