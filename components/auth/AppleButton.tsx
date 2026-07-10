'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_POST_LOGIN_PATH } from '@/lib/auth/post-login-redirect';

interface AppleButtonProps {
  redirectTarget?: string;
}

export function AppleButton({
  redirectTarget = DEFAULT_POST_LOGIN_PATH,
}: AppleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTarget)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
      // On success the browser navigates away; keep the spinner until then.
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p
          role="alert"
          className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleAppleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-pill border border-ink bg-transparent px-6 py-3 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" aria-hidden />
        ) : (
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.207 1c.088.603-.169 1.197-.504 1.635-.37.483-.98.86-1.589.815-.1-.588.177-1.19.518-1.621C10.99.36 11.63.007 12.207 1ZM14.7 12.044c-.27.618-.401.895-.75 1.443-.487.744-1.174 1.672-2.025 1.679-.757.007-0.952-.493-1.98-.487-1.028.006-1.241.496-2 .489-.85-.007-1.5-.851-1.987-1.596C4.876 11.452 4.5 9.18 5.321 7.997c.584-.853 1.505-1.352 2.374-1.352.882 0 1.438.488 2.168.488.708 0 1.14-.49 2.161-.49.776 0 1.597.423 2.179 1.154-.538.296-1.515 1.006-1.397 2.363.103 1.17.883 1.887 1.894 2.484Z" />
          </svg>
        )}
        Continue with Apple
      </button>
    </div>
  );
}
