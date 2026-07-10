'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface ReviewsSignInCtaProps {
  slug: string;
}

/** Sign-in hint on empty lists — hidden while loading or when signed in. */
export function ReviewsSignInCta({ slug }: ReviewsSignInCtaProps) {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  const next = `/products/${slug}#reviews`;

  return (
    <p className="mt-4 font-body text-sm text-ink-secondary">
      <Link
        href={`/login?redirect=${encodeURIComponent(next)}`}
        className="font-medium text-pine underline-offset-2 hover:underline"
      >
        Sign in
      </Link>{' '}
      to write the first review.
    </p>
  );
}
