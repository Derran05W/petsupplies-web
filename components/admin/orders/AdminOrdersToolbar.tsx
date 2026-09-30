'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

interface FilterPill {
  value: OrderStatus | 'all';
  label: string;
}

// Exactly the app-lowercase forms of the backend `OrderStatus` enum
// (PENDING|PAID|SHIPPED|FULFILLED|CANCELLED). `delivered`/`refunded` are not
// Prisma statuses and would 400 the list query, so they are not offered.
const PILLS: FilterPill[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
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
              'inline-flex items-center rounded-pill border px-3 py-1.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
              active
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-transparent text-ink-secondary hover:border-ink',
            )}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
