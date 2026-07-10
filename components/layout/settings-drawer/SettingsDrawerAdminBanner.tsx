'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

interface SettingsDrawerAdminBannerProps {
  onNavigate: () => void;
}

/**
 * Shown only for ADMIN users — an ink band that stands apart from the
 * shopper sections below it. Middleware remains authoritative: a stale
 * client role still navigates to `/admin`, where non-admins are bounced
 * home.
 */
export function SettingsDrawerAdminBanner({
  onNavigate,
}: SettingsDrawerAdminBannerProps) {
  return (
    <div className="border-b border-line bg-ink px-6 py-3">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2.5 py-1.5 font-body text-label uppercase text-paper no-underline opacity-90 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-amber"
      >
        <Shield size={16} aria-hidden className="shrink-0 text-amber" />
        <span>Open admin console</span>
        <span aria-hidden className="ml-auto">
          →
        </span>
      </Link>
    </div>
  );
}
