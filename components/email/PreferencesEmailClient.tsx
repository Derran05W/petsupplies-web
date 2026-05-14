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
          className="flex cursor-pointer gap-3 rounded-xl border border-warm-100 bg-warm-50/70 px-4 py-3"
        >
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 rounded border-warm-300 text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
            checked={preferences[row.key]}
            onChange={() => toggle(row.key)}
          />
          <span>
            <span className="block text-sm font-medium text-warm-900">
              {row.label}
            </span>
            <span className="block text-xs text-warm-600">
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
          className="animate-spin text-brand-500"
          aria-label="Loading preferences"
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-warm-900">
          Email preferences
        </h1>
        <p className="mt-2 text-sm text-warm-600">
          Decide which messages you still want to receive from us.
        </p>
      </div>

      <div className="space-y-3">{rowsMarkup}</div>

      {saveNotice === 'success' && (
        <p className="text-sm font-medium text-brand-600" role="status">
          Saved your preferences.
        </p>
      )}
      {saveNotice === 'error' && saveError ? (
        <p className="text-sm text-red-700" role="alert">
          {saveError}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="inline-flex items-center justify-center rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-200"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" aria-label="Saving" />
        ) : (
          'Save preferences'
        )}
      </button>
    </div>
  );
}
