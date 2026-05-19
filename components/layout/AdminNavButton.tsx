import Link from 'next/link';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminNavButtonProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Navbar entry for admins. Middleware still enforces access on `/admin/*`.
 */
export function AdminNavButton({ className, onClick }: AdminNavButtonProps) {
  return (
    <Link
      href="/admin"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-lg border border-danger-border bg-danger-solid px-2 py-1.5 font-body text-[11px] font-semibold text-danger-on-solid shadow-sm transition-colors hover:bg-danger-solid-hover sm:gap-1.5 sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm',
        className,
      )}
    >
      <Shield size={14} aria-hidden className="shrink-0 text-danger-on-solid" />
      <span className="max-sm:truncate">Admin</span>
    </Link>
  );
}
