'use client';

import packageJson from '../../../package.json';

interface SettingsDrawerFooterProps {
  onSignOut: () => void;
}

export function SettingsDrawerFooter({ onSignOut }: SettingsDrawerFooterProps) {
  return (
    <div className="mt-auto border-t border-warm-200 bg-surface-drawer px-6 py-4">
      <button
        type="button"
        onClick={() => {
          void onSignOut();
        }}
        className="mb-3 w-full rounded-lg border border-warm-200 bg-warm-100 py-2.5 font-body text-sm font-medium text-warm-900 transition-colors hover:bg-warm-200"
      >
        Sign out
      </button>
      <p className="text-center font-body text-[11px] text-warm-400">
        Settings · v{packageJson.version}
      </p>
    </div>
  );
}
