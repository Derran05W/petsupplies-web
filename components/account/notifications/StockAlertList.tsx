'use client';

import { useStockAlertsQuery } from '@/hooks/useStockAlerts';
import { StockAlertCard } from './StockAlertCard';
import { StockAlertEmpty } from './StockAlertEmpty';
import { StockAlertSkeleton } from './StockAlertSkeleton';

export function StockAlertList() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useStockAlertsQuery({ enabled: true });

  if (isPending && data === undefined) {
    return <StockAlertSkeleton />;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-card border border-danger-border bg-danger-surface px-6 py-8 text-center"
      >
        <p className="font-body text-sm text-danger-solid">
          {error.message || 'Could not load your stock alerts.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mx-auto inline-flex cursor-pointer items-center justify-center rounded-pill border border-danger-solid bg-danger-solid px-6 py-2.5 font-body text-micro uppercase text-danger-on-solid transition-all duration-base ease-soft hover:border-danger-solid-hover hover:bg-danger-solid-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid disabled:cursor-not-allowed disabled:opacity-60"
        >
          Try again
        </button>
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return <StockAlertEmpty />;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((alert) => (
        <li key={alert.productId}>
          <StockAlertCard alert={alert} />
        </li>
      ))}
    </ul>
  );
}
