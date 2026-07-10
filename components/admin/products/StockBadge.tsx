import { formatStockBadge, type StockBadgeState } from '@/lib/utils/format';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/config';
import { cn } from '@/lib/utils';

interface StockBadgeProps {
  stockCount: number;
  className?: string;
}

const LABEL: Record<StockBadgeState, string> = {
  in_stock: 'In stock',
  low: 'Low',
  out: 'Out',
};

const CLASSES: Record<StockBadgeState, string> = {
  in_stock: 'border-pine/40 bg-tile-sage text-tile-sage-ink',
  low: 'border-amber/40 bg-tile-amber text-tile-amber-ink',
  out: 'border-danger-border bg-danger-surface text-danger-solid',
};

export function StockBadge({ stockCount, className }: StockBadgeProps) {
  const state = formatStockBadge(stockCount, LOW_STOCK_THRESHOLD);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
        CLASSES[state],
        className,
      )}
    >
      <span>{LABEL[state]}</span>
      <span aria-hidden className="text-current/70">
        ·
      </span>
      <span>{stockCount}</span>
    </span>
  );
}
