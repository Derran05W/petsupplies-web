'use client';

import { Button } from '@/components/ui';
import packageJson from '../../../package.json';

interface SettingsDrawerFooterProps {
  onSignOut: () => void;
}

export function SettingsDrawerFooter({ onSignOut }: SettingsDrawerFooterProps) {
  return (
    <div className="mt-auto border-t border-line px-6 py-5">
      <Button
        variant="ghost"
        onClick={() => {
          void onSignOut();
        }}
        className="mb-3 w-full px-5 py-3"
      >
        Sign out
      </Button>
      <p className="text-center font-body text-[11px] text-ink-faint">
        Settings · v{packageJson.version}
      </p>
    </div>
  );
}
