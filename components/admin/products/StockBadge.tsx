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
  in_stock: 'bg-brand-50 text-brand-600',
  low: 'bg-amber-50 text-amber-700',
  out: 'bg-warm-200 text-warm-600',
};

export function StockBadge({ stockCount, className }: StockBadgeProps) {
  const state = formatStockBadge(stockCount, LOW_STOCK_THRESHOLD);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-body text-xs font-medium',
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
