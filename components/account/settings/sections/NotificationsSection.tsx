'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  mergeNotificationPrefs,
  type NotificationPrefs,
} from '@/lib/account/notification-prefs';

interface NotificationsSectionProps {
  initialPrefs: NotificationPrefs;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-tile border border-line bg-paper px-4 py-3">
      <div className="min-w-0 pr-2">
        <label htmlFor={id} className="font-body text-sm font-medium text-ink">
          {label}
        </label>
        <p className="mt-0.5 font-body text-xs text-ink-muted">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          'mt-1 size-4 shrink-0 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      />
    </div>
  );
}

export function NotificationsSection({
  initialPrefs,
}: NotificationsSectionProps) {
  const router = useRouter();
  const merged = mergeNotificationPrefs(initialPrefs);
  const [prefs, setPrefs] = useState(merged);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function persist(partial: NotificationPrefs) {
    setError(null);
    const supabase = createClient();
    const nextFull = { ...prefs, ...partial };
    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({
        data: {
          notification_prefs: {
            marketing: nextFull.marketing,
            orderUpdates: nextFull.orderUpdates,
            backInStock: nextFull.backInStock,
            subscriptionReminders: nextFull.subscriptionReminders,
          },
        },
      });
      if (err) {
        setError(err.message);
        return;
      }
      setPrefs(nextFull);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="notifications"
      aria-labelledby="notifications-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="notifications-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Notifications
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Choose what we email you about. Transactional messages may still be sent
        when required for orders or legal notices.
      </p>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-xs text-danger-solid"
        >
          {error}
        </p>
      ) : null}

      <fieldset disabled={saving} className="flex flex-col gap-3 border-0 p-0">
        <legend className="sr-only">Email notification preferences</legend>
        <ToggleRow
          id="pref-marketing"
          label="Marketing & tips"
          description="Occasional promotions and pet-care ideas."
          checked={prefs.marketing}
          disabled={saving}
          onChange={(v) => void persist({ marketing: v })}
        />
        <ToggleRow
          id="pref-orders"
          label="Order updates"
          description="Confirmations, shipping, and delivery notices."
          checked={prefs.orderUpdates}
          disabled={saving}
          onChange={(v) => void persist({ orderUpdates: v })}
        />
        <ToggleRow
          id="pref-stock"
          label="Back in stock"
          description="When items on your alert list are available again."
          checked={prefs.backInStock}
          disabled={saving}
          onChange={(v) => void persist({ backInStock: v })}
        />
        <ToggleRow
          id="pref-subs"
          label="Subscribe & Save"
          description="Renewals, skips, and subscription changes."
          checked={prefs.subscriptionReminders}
          disabled={saving}
          onChange={(v) => void persist({ subscriptionReminders: v })}
        />
      </fieldset>

      <p className="mt-6 font-body text-xs text-ink-muted">
        Manage individual product alerts on the{' '}
        <Link
          href="/account/notifications"
          className="font-medium text-pine underline-offset-2 hover:underline"
        >
          stock alerts
        </Link>{' '}
        page.
      </p>

      {saving ? (
        <p className="mt-2 inline-flex items-center gap-1 font-body text-xs text-ink-muted">
          <Loader2 size={12} className="animate-spin" aria-hidden />
          Saving…
        </p>
      ) : null}
    </section>
  );
}
