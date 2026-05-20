'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
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
    <section className="border-b border-warm-200 bg-surface-drawer px-6 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-base tracking-[-0.02em] text-warm-900">
          Recent orders
        </h3>
        <Link
          href={accountListHref}
          onClick={onNavigate}
          className="inline-flex items-center gap-0.5 font-body text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRight size={14} aria-hidden />
        </Link>
      </div>

      {orders === null ? (
        <ul className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-14 animate-pulse rounded-xl bg-warm-100"
              aria-hidden
            />
          ))}
        </ul>
      ) : error ? (
        <p className="font-body text-xs text-warm-600">
          Couldn&apos;t load orders.{' '}
          <Link
            href={accountListHref}
            onClick={onNavigate}
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            Open orders
          </Link>
        </p>
      ) : orders.length === 0 ? (
        <p className="font-body text-xs text-warm-600">
          No orders yet.{' '}
          <Link
            href="/products"
            onClick={onNavigate}
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            Browse products
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={appendReturnTo(`/account/orders/${order.id}`, pathname)}
                onClick={onNavigate}
                className="flex items-center justify-between gap-3 rounded-xl border border-warm-200 bg-warm-100 px-3 py-2.5 transition-colors hover:border-warm-300 hover:bg-warm-200"
              >
                <div className="min-w-0">
                  <p className="truncate font-body text-xs font-medium text-warm-900">
                    Order {shortId(order.id)}
                  </p>
                  <p className="text-warm-500 font-body text-[11px]">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 font-display text-sm text-warm-900">
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
