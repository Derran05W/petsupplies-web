'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { EmailMarketingPreferences } from '@/types/email';
import { ApiError } from '@/lib/api/client';
import { getEmailPreferences, patchEmailPreferences } from '@/lib/api/email';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";

interface PreferenceRow {
  key: keyof EmailMarketingPreferences;
  label: string;
  description: string;
}

const ROWS: PreferenceRow[] = [
  {
    key: 'promotional',
    label: 'Promotions & tips',
    description: 'New gear, seasonal bundles, and care tips.',
  },
  {
    key: 'abandonedCart',
    label: 'Abandoned cart reminders',
    description: 'A friendly nudge if you leave checkout early.',
  },
  {
    key: 'backInStock',
    label: 'Back in stock alerts',
    description: 'When a saved item returns to shelves.',
  },
  {
    key: 'orderUpdates',
    label: 'Order updates',
    description: 'Payment, shipping, and delivery notifications.',
  },
];

interface PreferencesEmailClientProps {
  token: string;
}

export function PreferencesEmailClient({ token }: PreferencesEmailClientProps) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailMarketingPreferences>({
    promotional: false,
    abandonedCart: false,
    backInStock: false,
    orderUpdates: false,
  });
  const [loadError, setLoadError] = useState<string | undefined>();
  const [saveNotice, setSaveNotice] = useState<'idle' | 'success' | 'error'>(
    'idle',
  );
  const [saveError, setSaveError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await getEmailPreferences(token);
        if (!cancelled) {
          setPreferences(response.preferences);
          setStatus('ready');
        }
      } catch (err) {
        if (cancelled) return;
        const text =
          err instanceof ApiError
            ? err.isNetworkError
              ? NETWORK_ERROR_MESSAGE
              : (err.message ?? 'We could not load your preferences.')
            : 'We could not load your preferences.';
        setLoadError(text);
        setStatus('ready');
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = useCallback((key: keyof EmailMarketingPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveNotice('idle');
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveNotice('idle');
    setSaveError(undefined);
    try {
      await patchEmailPreferences(token, preferences);
      setSaveNotice('success');
    } catch (err) {
      setSaveNotice('error');
      const text =
        err instanceof ApiError
          ? err.isNetworkError
            ? NETWORK_ERROR_MESSAGE
            : (err.message ?? 'Could not save. Try again.')
          : 'Could not save. Try again.';
      setSaveError(text);
    } finally {
      setSaving(false);
    }
  }, [preferences, token]);

  const rowsMarkup = useMemo(
    () =>
      ROWS.map((row) => (
        <label
          key={row.key}
          className="flex cursor-pointer gap-3 rounded-tile border border-line bg-paper px-4 py-3"
        >
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            checked={preferences[row.key]}
            onChange={() => toggle(row.key)}
          />
          <span>
            <span className="block font-body text-sm font-medium text-ink">
              {row.label}
            </span>
            <span className="block font-body text-xs leading-body text-ink-secondary">
              {row.description}
            </span>
          </span>
        </label>
      )),
    [preferences, toggle],
  );

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-10">
        <Loader2
          size={28}
          className="animate-spin text-pine motion-reduce:animate-none"
          aria-label="Loading preferences"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
      >
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-5 font-body">
      <div>
        <p className="font-body text-kicker uppercase text-pine">Your inbox</p>
        <h1 className="mt-2 font-display text-2xl text-ink">
          Email preferences
        </h1>
        <p className="mt-2 text-sm leading-body text-ink-secondary">
          Decide which messages you still want to receive from us.
        </p>
      </div>

      <div className="space-y-3">{rowsMarkup}</div>

      {saveNotice === 'success' && (
        <p className="text-sm font-medium text-pine" role="status">
          Saved your preferences.
        </p>
      )}
      {saveNotice === 'error' && saveError ? (
        <p className="text-sm text-danger-solid" role="alert">
          {saveError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <Loader2
            size={16}
            className="animate-spin motion-reduce:animate-none"
            aria-label="Saving"
          />
        ) : (
          'Save preferences'
        )}
      </button>
    </div>
  );
}
