'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { APPEARANCE_OPTIONS, type Appearance } from '@/lib/theme/types';

export function PreferencesSection() {
  const { preferences, resolvedTheme, setPreferences, saving } = useTheme();

  function setAppearance(appearance: Appearance) {
    void setPreferences({ appearance });
  }

  const systemHint =
    preferences.appearance === 'system'
      ? `Using ${resolvedTheme} theme based on your device.`
      : null;

  return (
    <section
      id="preferences"
      aria-labelledby="preferences-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="preferences-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Appearance
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Light is the default shop look. Dark keeps the warm coral palette on a
        deeper background. Tropical uses sage, sun, coral, and teal. System
        follows your device.
      </p>

      <fieldset className="border-0 p-0">
        <legend className="sr-only">Appearance</legend>
        <div
          role="radiogroup"
          aria-label="Appearance"
          className="grid gap-3 sm:grid-cols-2"
        >
          {APPEARANCE_OPTIONS.map((option) => {
            const selected = preferences.appearance === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={saving}
                onClick={() => setAppearance(option.id)}
                className={cn(
                  'flex flex-col items-start gap-3 rounded-tile border px-4 py-4 text-left transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                  selected
                    ? 'border-pine bg-panel ring-2 ring-pine ring-offset-2 ring-offset-paper'
                    : 'border-line bg-paper hover:border-ink',
                  saving && 'cursor-not-allowed opacity-60',
                )}
              >
                <span className="flex gap-1" aria-hidden>
                  {option.preview.map((hex) => (
                    <span
                      key={hex}
                      className="size-7 rounded-full border border-line shadow-sm"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
                <span>
                  <span className="font-body text-sm font-medium text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block font-body text-xs leading-snug text-ink-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {systemHint ? (
          <p className="mt-3 font-body text-xs text-ink-muted">{systemHint}</p>
        ) : null}
      </fieldset>

      {saving ? (
        <p className="mt-4 inline-flex items-center gap-1 font-body text-xs text-ink-muted">
          <Loader2 size={12} className="animate-spin" aria-hidden />
          Saving…
        </p>
      ) : null}
    </section>
  );
}
