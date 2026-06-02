'use client';

import { useState } from 'react';
import { useCartHasHydrated, useCartLines } from '@/hooks/useCart';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutSummary } from './CheckoutSummary';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { EmptyCheckout } from './EmptyCheckout';

export function CheckoutClient() {
  const hasHydrated = useCartHasHydrated();
  const lines = useCartLines();
  const [selectedShippingCents, setSelectedShippingCents] = useState<
    number | null
  >(null);

  if (!hasHydrated) {
    return <CheckoutSkeleton />;
  }

  if (lines.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr]">
      <CheckoutForm onShippingAmountChange={setSelectedShippingCents} />
      <CheckoutSummary selectedShippingCents={selectedShippingCents} />
    </div>
  );
}
