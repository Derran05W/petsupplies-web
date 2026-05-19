'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface FilterPill {
  value: OrderStatus | 'all';
  label: string;
}

const PILLS: FilterPill[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export function AdminOrdersToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get('status') ?? 'all') as OrderStatus | 'all';

  const handleClick = (next: OrderStatus | 'all') => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('status');
    else params.set('status', next);
    params.delete('page');
    params.delete('selected');
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/admin/orders?${qs}` : '/admin/orders', {
      scroll: false,
    });
  };

  return (
    <div
      role="group"
      aria-label="Status filter"
      className="mb-6 flex flex-wrap items-center gap-1.5"
    >
      {PILLS.map((pill) => {
        const active = pill.value === current;
        return (
          <button
            key={pill.value}
            type="button"
            onClick={() => handleClick(pill.value)}
            aria-pressed={active}
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 font-body text-xs font-medium transition-colors',
              active
                ? 'bg-warm-900 text-warm-50'
                : 'border border-warm-300 bg-surface-card text-warm-900 hover:bg-warm-100',
            )}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
