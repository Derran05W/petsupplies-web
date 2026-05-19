'use client';

import { useState } from 'react';
import { Loader2, PencilLine } from 'lucide-react';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import {
  useCancelSubscriptionMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useUpdateSubscriptionMutation,
} from '@/hooks/useSubscriptions';
import { usePetsQuery } from '@/hooks/usePets';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import type { Subscription, SubscriptionInterval } from '@/types/subscription';
import {
  SUBSCRIPTION_INTERVAL_LABEL,
  SUBSCRIPTION_INTERVALS,
} from '@/types/subscription';
import { cn } from '@/lib/utils';

interface SubscriptionActionsProps {
  subscription: Subscription;
}

export function SubscriptionActions({
  subscription: sub,
}: SubscriptionActionsProps) {
  const pauseMut = usePauseSubscriptionMutation();
  const resumeMut = useResumeSubscriptionMutation();
  const cancelMut = useCancelSubscriptionMutation();
  const updateMut = useUpdateSubscriptionMutation();
  const { user, loading: authLoading } = useAuth();

  const { data: pets = [] } = usePetsQuery(!authLoading && Boolean(user));

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editQty, setEditQty] = useState(sub.quantity);
  const [editInterval, setEditInterval] = useState<SubscriptionInterval>(
    sub.interval,
  );
  const [editPetId, setEditPetId] = useState<string>(sub.petId ?? '');
  const [panelError, setPanelError] = useState<string | null>(null);

  const actionable =
    sub.status !== 'canceled' &&
    sub.status !== 'incomplete' &&
    sub.status !== 'past_due';

  const canPause =
    actionable && sub.status === 'active' && !sub.cancelAtPeriodEnd;

  const canResume = actionable && sub.status === 'paused';

  const canCancel =
    actionable && sub.status !== 'canceled' && !sub.cancelAtPeriodEnd;

  const blocking =
    pauseMut.isPending ||
    resumeMut.isPending ||
    cancelMut.isPending ||
    updateMut.isPending;

  const handleCancelConfirmed = async () => {
    setPanelError(null);
    try {
      await cancelMut.mutateAsync(sub.id);
    } catch (e) {
      setPanelError(
        e instanceof Error ? e.message : 'Unable to cancel right now.',
      );
    }
    setConfirmCancel(false);
  };

  const handleSaveEdit = async () => {
    setPanelError(null);
    const patch = {
      quantity: editQty,
      interval: editInterval,
      ...(editPetId.trim().length > 0
        ? { petId: editPetId.trim() }
        : { petId: null as null }),
    };
    try {
      await updateMut.mutateAsync({ id: sub.id, patch });
      setEditOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.validationErrors && e.message) {
        setPanelError(e.message);
        return;
      }
      setPanelError(
        e instanceof Error ? e.message : 'Update failed — try again.',
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {panelError ? (
          <p role="alert" className="font-body text-sm text-red-600">
            {panelError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <button
              type="button"
              disabled={blocking}
              onClick={() =>
                pauseMut.mutate(sub.id, {
                  onError: (err) =>
                    setPanelError(
                      err.message ?? 'Could not pause this subscription.',
                    ),
                })
              }
              className={cn(actionButtonNeutral, blocking && 'opacity-60')}
            >
              {pauseMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Pause
                </>
              ) : (
                'Pause'
              )}
            </button>
          ) : null}

          {canResume ? (
            <button
              type="button"
              disabled={blocking}
              onClick={() =>
                resumeMut.mutate(sub.id, {
                  onError: (err) =>
                    setPanelError(
                      err.message ?? 'Could not resume this subscription.',
                    ),
                })
              }
              className={cn(actionButtonNeutral, blocking && 'opacity-60')}
            >
              {resumeMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Resume
                </>
              ) : (
                'Resume'
              )}
            </button>
          ) : null}

          {canCancel ? (
            <button
              type="button"
              disabled={blocking}
              onClick={() => {
                setPanelError(null);
                setConfirmCancel(true);
              }}
              className={cn(
                'rounded-lg border border-red-200 bg-surface-card px-3 py-2 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-50',
                blocking && 'opacity-60',
              )}
            >
              Cancel renewal
            </button>
          ) : null}

          {actionable && !sub.cancelAtPeriodEnd ? (
            <button
              type="button"
              disabled={blocking}
              onClick={() => {
                setEditQty(sub.quantity);
                setEditInterval(sub.interval);
                setEditPetId(sub.petId ?? '');
                setPanelError(null);
                setEditOpen((open) => !open);
              }}
              className={cn(actionButtonNeutral, blocking && 'opacity-60')}
            >
              <PencilLine size={16} aria-hidden />
              {editOpen ? 'Close editor' : 'Change plan'}
            </button>
          ) : null}
        </div>

        {editOpen ? (
          <div className="bg-warm-50/60 flex flex-col gap-4 rounded-xl border border-warm-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor={`sub-qty-${sub.id}`}
                className="text-warm-700 font-body text-sm font-medium"
              >
                Quantity
              </label>
              <input
                id={`sub-qty-${sub.id}`}
                type="number"
                min={1}
                max={99}
                value={editQty}
                onChange={(e) =>
                  setEditQty(
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                  )
                }
                className="h-10 w-16 rounded-lg border border-warm-300 bg-surface-card px-2 text-center font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-warm-700 font-body text-sm font-medium">
                Cadence
              </legend>
              <div className="flex flex-wrap gap-2">
                {SUBSCRIPTION_INTERVALS.map((int) => (
                  <label
                    key={int}
                    className={cn(
                      'cursor-pointer rounded-lg border px-3 py-2 font-body text-xs',
                      editInterval === int
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-warm-200 bg-surface-card',
                    )}
                  >
                    <input
                      type="radio"
                      name={`interval-${sub.id}`}
                      className="mr-2"
                      checked={editInterval === int}
                      onChange={() => setEditInterval(int)}
                    />
                    {SUBSCRIPTION_INTERVAL_LABEL[int]}
                  </label>
                ))}
              </div>
            </fieldset>

            {pets.length > 0 ? (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`sub-pet-${sub.id}`}
                  className="text-warm-700 font-body text-sm font-medium"
                >
                  Pet (optional)
                </label>
                <select
                  id={`sub-pet-${sub.id}`}
                  value={editPetId}
                  onChange={(e) => setEditPetId(e.target.value)}
                  className="rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">None</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <button
              type="button"
              disabled={blocking}
              onClick={() => void handleSaveEdit()}
              className={cn(primaryButtonClass, blocking && 'opacity-60')}
            >
              {updateMut.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel renewal?"
        description="Your subscription stays active until the end of this billing period. You can subscribe again anytime from any eligible product."
        confirmLabel={
          cancelMut.isPending ? 'Cancelling…' : 'Yes, cancel renewal'
        }
        cancelLabel="Keep subscription"
        destructive
        busy={cancelMut.isPending}
        onClose={() => {
          if (!cancelMut.isPending) setConfirmCancel(false);
        }}
        onConfirm={() => void handleCancelConfirmed()}
      />
    </>
  );
}

const actionButtonNeutral =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-warm-200 bg-surface-card px-3 py-2 font-body text-sm font-medium text-warm-800 transition-colors hover:bg-warm-50';

const primaryButtonClass =
  'inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2 font-body text-sm font-medium text-white hover:bg-brand-500';
