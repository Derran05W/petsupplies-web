'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

interface SettingsDrawerAdminBannerProps {
  onNavigate: () => void;
}

/**
 * Shown only for ADMIN users. Middleware remains authoritative — a stale
 * client role still navigates to `/admin`, where non-admins are bounced home.
 */
export function SettingsDrawerAdminBanner({
  onNavigate,
}: SettingsDrawerAdminBannerProps) {
  return (
    <div className="border-b border-danger-border bg-danger-surface px-6 py-3">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-lg border border-danger-border bg-surface-card px-3 py-2.5 font-body text-sm font-semibold text-warm-900 shadow-sm transition-colors hover:bg-danger-surface"
      >
        <Shield size={18} aria-hidden className="shrink-0 text-danger-solid" />
        <span>Open admin console</span>
      </Link>
    </div>
  );
}
