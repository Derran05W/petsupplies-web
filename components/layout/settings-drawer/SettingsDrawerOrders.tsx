'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getOrders } from '@/lib/api/orders';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { appendReturnTo } from '@/lib/navigation/append-return-to';
import type { OrderSummary } from '@/types/order';

interface SettingsDrawerOrdersProps {
  onNavigate: () => void;
}

function shortId(id: string): string {
  return `#${id.slice(-8)}`;
}

export function SettingsDrawerOrders({
  onNavigate,
}: SettingsDrawerOrdersProps) {
  const pathname = usePathname();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState(false);

  const accountListHref = appendReturnTo('/account', pathname);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        if (!cancelled) setOrders([]);
        return;
      }
      try {
        const data = await getOrders({
          page: 1,
          limit: 3,
          accessToken: token,
        });
        if (!cancelled) setOrders(data.orders);
      } catch {
        if (!cancelled) {
          setError(true);
          setOrders([]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-b border-line px-6 py-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="font-body text-kicker uppercase text-pine">
          Recent orders
        </h3>
        <Link
          href={accountListHref}
          onClick={onNavigate}
          className="font-body text-micro uppercase text-ink no-underline opacity-75 transition-opacity duration-fast hover:opacity-100"
        >
          View all →
        </Link>
      </div>

      {orders === null ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-14 animate-pulse rounded-card bg-panel"
              aria-hidden
            />
          ))}
        </ul>
      ) : error ? (
        <p className="font-body text-xs text-ink-muted">
          Couldn&apos;t load orders.{' '}
          <Link
            href={accountListHref}
            onClick={onNavigate}
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            Open orders
          </Link>
        </p>
      ) : orders.length === 0 ? (
        <p className="font-body text-xs text-ink-muted">
          No orders yet.{' '}
          <Link
            href="/products"
            onClick={onNavigate}
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            Browse products
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={appendReturnTo(`/account/orders/${order.id}`, pathname)}
                onClick={onNavigate}
                className="flex items-center justify-between gap-3 py-3 no-underline transition-colors duration-fast hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-pine"
              >
                <div className="min-w-0">
                  <p className="truncate font-body text-xs font-semibold text-ink">
                    Order {shortId(order.id)}
                  </p>
                  <p className="font-body text-[11px] text-ink-faint">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-display text-base text-ink">
                  {formatPrice(order.totalCents, order.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
