'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function getInitial(value: string | undefined | null): string {
  if (!value) return '?';
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

interface AuthSlotProps {
  className?: string;
}

export function AuthSlot({ className }: AuthSlotProps) {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (loading) {
    return (
      <div
        aria-hidden
        className={cn('h-8 w-16 rounded-md bg-warm-100', className)}
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={cn(
          'font-body text-sm text-warm-600 transition-colors hover:text-warm-900',
          className,
        )}
      >
        Sign in
      </Link>
    );
  }

  const fullName =
    typeof user.user_metadata?.['full_name'] === 'string'
      ? (user.user_metadata['full_name'] as string)
      : null;
  const initial = getInitial(fullName ?? user.email);
  const displayName = fullName ?? user.email ?? 'Account';
  const isAdmin =
    (user.user_metadata as Record<string, unknown> | null)?.['role'] ===
    'ADMIN';

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        className="inline-flex size-8 items-center justify-center rounded-full bg-brand-50 font-body text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-warm-200 bg-white py-1 shadow-sm"
        >
          <p className="truncate px-3 py-2 font-body text-xs text-warm-400">
            {displayName}
          </p>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 font-body text-sm text-warm-900 hover:bg-warm-100"
          >
            Account
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 font-body text-sm text-warm-900 hover:bg-warm-100"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="block w-full px-3 py-2 text-left font-body text-sm text-warm-900 hover:bg-warm-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
