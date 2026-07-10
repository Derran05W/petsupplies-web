'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { getCartRecoveryByToken } from '@/lib/api/cart-recovery';
import { useCartHasHydrated } from '@/hooks/useCart';
import { useCartStore } from '@/lib/store/cart';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";

interface CartRecoveryClientProps {
  token: string;
}

export function CartRecoveryClient({ token }: CartRecoveryClientProps) {
  const router = useRouter();
  const hasHydrated = useCartHasHydrated();
  const replaceLines = useCartStore((state) => state.replaceLines);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    async function run() {
      try {
        const payload = await getCartRecoveryByToken(token);
        if (cancelled) return;
        replaceLines(payload.lines);
        if (cancelled) return;
        router.push(
          payload.redirectToCheckout === true ? '/checkout' : '/cart',
        );
      } catch (err) {
        if (cancelled) return;
        const text =
          err instanceof ApiError
            ? err.isNetworkError
              ? NETWORK_ERROR_MESSAGE
              : (err.message ?? 'Something went wrong. Please try again.')
            : 'Something went wrong. Please try again.';
        setError(text);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, replaceLines, router, token]);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center font-body text-sm text-ink-secondary">
      <Loader2
        size={28}
        className="animate-spin text-pine motion-reduce:animate-none"
        aria-label="Recovering cart"
      />
      <p>Restoring your cart…</p>
    </div>
  );
}
