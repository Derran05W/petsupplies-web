'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import type { StockAlert } from '@/types/stock-alert';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { useDeleteStockAlertMutation } from '@/hooks/useStockAlerts';

const FALLBACK_IMAGE = '/images/hero-placeholder.jpg';

interface StockAlertCardProps {
  alert: StockAlert;
}

function pickPrimaryImage(alert: StockAlert): { url: string; alt: string } {
  const { product } = alert;
  const primary = product.images.find((image) => image.isPrimary);
  const first = product.images[0];
  const chosen = primary ?? first;
  if (!chosen) {
    return { url: FALLBACK_IMAGE, alt: product.name };
  }
  return { url: chosen.url, alt: chosen.alt || product.name };
}

export function StockAlertCard({ alert }: StockAlertCardProps) {
  const { product } = alert;
  const { url: imageUrl, alt: imageAlt } = pickPrimaryImage(alert);
  const removeMutation = useDeleteStockAlertMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = removeMutation.isPending;

  return (
    <>
      <article className="flex flex-col rounded-card border border-line bg-paper p-4 transition-colors duration-fast hover:border-ink">
        <Link
          href={`/products/${product.slug}`}
          className="relative mb-3 aspect-square overflow-hidden rounded-tile bg-panel"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </Link>

        <Link
          href={`/products/${product.slug}`}
          className="font-display text-lg leading-snug tracking-[-0.02em] text-ink transition-colors duration-fast hover:text-pine"
        >
          {product.name}
        </Link>

        <p className="mt-2 font-display text-sm text-ink">
          {formatPrice(product.priceCents)}
        </p>

        {!product.inStock ? (
          <p className="mt-2 font-body text-xs text-ink-muted">
            Waiting for stock
          </p>
        ) : (
          <p className="mt-2 font-body text-xs text-pine">
            Back in stock — view product
          </p>
        )}

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
          className={cn(
            'mt-4 inline-flex items-center justify-center rounded-pill border border-ink bg-transparent px-4 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
            busy
              ? 'cursor-wait opacity-70'
              : 'hover:border-danger-solid hover:bg-danger-surface hover:text-danger-solid',
          )}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Removing…
            </>
          ) : (
            'Cancel alert'
          )}
        </button>
      </article>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this alert?"
        description="You will no longer receive an email when this product is restocked."
        confirmLabel="Cancel alert"
        cancelLabel="Keep"
        destructive
        busy={busy}
        onClose={() => {
          if (!busy) setConfirmOpen(false);
        }}
        onConfirm={() =>
          removeMutation.mutate(product.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </>
  );
}
