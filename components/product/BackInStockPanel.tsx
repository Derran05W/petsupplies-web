'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import type { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import {
  useCreateStockAlertMutation,
  useDeleteStockAlertMutation,
  useIsStockAlertedFor,
} from '@/hooks/useStockAlerts';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';

function isLikelyRestockConflict(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const m = `${err.message}`.toLowerCase();
  return (
    err.status === 400 &&
    (m.includes('stock') || m.includes('available') || m.includes('in stock'))
  );
}

interface BackInStockPanelProps {
  product: Product;
}

/**
 * PDP-only notify flow for out-of-stock products. Mirrors wishlist-style
 * auth redirect; uses TanStack Query alerts cache for subscribed state.
 */
export function BackInStockPanel({ product }: BackInStockPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const isAlerted = useIsStockAlertedFor(product.id);
  const createMutation = useCreateStockAlertMutation();
  const deleteMutation = useDeleteStockAlertMutation();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hintRefresh, setHintRefresh] = useState(false);

  if (product.inStock) {
    return null;
  }

  const redirectToLogin = () => {
    const suffix =
      pathname && pathname.length > 0
        ? `?redirect=${encodeURIComponent(pathname)}`
        : '';
    router.push(`/login${suffix}`);
  };

  const handleNotify = async () => {
    setLocalError(null);
    setHintRefresh(false);
    if (!user) return;
    try {
      await createMutation.mutateAsync({
        productId: product.id,
        product,
      });
      router.refresh();
    } catch (err) {
      if (isLikelyRestockConflict(err)) {
        setHintRefresh(true);
        setLocalError(
          'This product appears to be back in stock — refresh this page to add it to your cart.',
        );
        return;
      }
      if (err instanceof ApiError) {
        setLocalError(err.message || 'Could not save your alert.');
        return;
      }
      setLocalError('Could not save your alert. Try again.');
    }
  };

  const handleConfirmCancel = () => {
    setLocalError(null);
    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        setConfirmCancelOpen(false);
        router.refresh();
      },
      onError: () => {
        setLocalError('Could not cancel this alert.');
      },
    });
  };

  const closeConfirm = () => {
    if (!deleteMutation.isPending) {
      setConfirmCancelOpen(false);
    }
  };

  let body: ReactNode;

  if (authLoading) {
    body = (
      <span
        className="inline-flex items-center gap-2 font-body text-sm text-ink-muted"
        aria-busy="true"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Checking your session…
      </span>
    );
  } else if (!user) {
    body = (
      <button
        type="button"
        onClick={redirectToLogin}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-transparent px-5 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine sm:w-auto"
      >
        Notify me when back
      </button>
    );
  } else if (isAlerted) {
    body = (
      <div className="flex flex-col gap-2">
        <p className="font-body text-sm text-ink-secondary" role="status">
          We&apos;ll email you when this is back.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => setConfirmCancelOpen(true)}
            disabled={deleteMutation.isPending}
            className="font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel alert
          </button>
          <Link
            href="/account/notifications"
            className="font-body text-micro uppercase text-pine transition-opacity duration-fast hover:opacity-70"
          >
            Manage alerts
          </Link>
        </div>
      </div>
    );
  } else {
    body = (
      <button
        type="button"
        disabled={createMutation.isPending}
        aria-busy={createMutation.isPending}
        onClick={() => void handleNotify()}
        className={cn(
          'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-transparent px-5 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine sm:w-auto',
          createMutation.isPending
            ? 'cursor-wait opacity-80 hover:bg-transparent hover:text-ink'
            : '',
        )}
      >
        {createMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          'Notify me when back'
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-body text-micro uppercase text-ink">Out of stock</p>
      </div>

      <p className="font-body text-sm text-ink-secondary">
        Get an email when this item is available again.
      </p>

      {localError ? (
        <div
          role="alert"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid"
        >
          <p>{localError}</p>
          {hintRefresh ? (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-2 font-medium underline-offset-4 hover:underline"
            >
              Refresh page
            </button>
          ) : null}
        </div>
      ) : null}

      {body}

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancel back-in-stock alert?"
        description="You will stop receiving email when this product is restocked."
        confirmLabel="Cancel alert"
        cancelLabel="Keep alert"
        destructive
        busy={deleteMutation.isPending}
        onClose={closeConfirm}
        onConfirm={() => handleConfirmCancel()}
      />
    </div>
  );
}
