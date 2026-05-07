'use client';

import { useCartHasHydrated, useCartLines } from '@/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummary } from './CheckoutSummary';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { EmptyCheckout } from './EmptyCheckout';

/**
 * Client gate around the `/checkout` content. The cart store reads from
 * localStorage so this entire surface is client-only:
 *
 *   - !hasHydrated      → skeleton (avoids layout shift on hydration)
 *   - lines.length === 0 → empty-cart panel (NO server redirect; cart is
 *                          client-only and `redirect('/cart')` would loop
 *                          once the user lands on /cart which reads the
 *                          same store)
 *   - otherwise         → form + sticky summary in a 3fr/2fr grid on lg
 */
export function CheckoutClient() {
  const hasHydrated = useCartHasHydrated();
  const lines = useCartLines();

  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (lines.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
      <CheckoutForm />
      <CheckoutSummary />
    </div>
  );
}
