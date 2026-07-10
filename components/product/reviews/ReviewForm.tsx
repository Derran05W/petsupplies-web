'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import {
  reviewCreateSchema,
  type ReviewFormInputValues,
} from '@/lib/reviews/schemas';
import type { Review } from '@/types/review';
import { accountFirstNameFromUser } from '@/lib/reviews/display-name';
import {
  classifyReviewMutationError,
  createProductReview,
} from '@/lib/api/reviews';

const SIGN_IN_REQUIRED = 'Sign in to submit a review';

interface ReviewFormProps {
  slug: string;
  existingReview?: Review | null;
  viewerFirstName?: string;
}

export function ReviewForm({
  slug,
  existingReview,
  viewerFirstName: viewerFirstNameProp,
}: ReviewFormProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const loginHref = `/login?redirect=${encodeURIComponent(`/products/${slug}#reviews`)}`;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    reset,
    watch,
    clearErrors,
  } = useForm<ReviewFormInputValues>({
    resolver: zodResolver(reviewCreateSchema),
    defaultValues: { rating: 5, title: '', body: '' },
  });

  const ratingValue = watch('rating');
  const bodyValue = watch('body');
  const isTyping = bodyValue.trim().length > 0;

  const viewerFirstName =
    viewerFirstNameProp ?? (user ? accountFirstNameFromUser(user) : undefined);

  const canSubmit = !!user && !existingReview;

  const onSubmit = handleSubmit(async (data) => {
    if (!canSubmit) return;

    clearErrors('root');
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError('root', {
          message: `${SIGN_IN_REQUIRED}. Sign in and try again.`,
        });
        setSubmitting(false);
        return;
      }

      await createProductReview(
        slug,
        {
          rating: data.rating,
          body: data.body,
          ...(data.title.trim().length > 0 ? { title: data.title.trim() } : {}),
        },
        { accessToken: token },
      );
      reset({ rating: 5, title: '', body: '' });
      router.refresh();
    } catch (err) {
      const classified = classifyReviewMutationError(err);
      if (classified.kind === 'unauthorized') {
        router.refresh();
      }
      setError('root', { message: classified.message });
    } finally {
      setSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="rounded-card border border-line bg-panel p-6 font-body text-sm text-ink-muted">
        Checking sign-in status…
      </div>
    );
  }

  if (existingReview && user) {
    return (
      <div className="rounded-card border border-line bg-panel p-6">
        <h3 className="font-display text-xl tracking-[-0.01em] text-ink">
          Your review
        </h3>
        <p className="mt-2 font-body text-sm text-ink-secondary">
          You already shared feedback for this product
          {viewerFirstName ? (
            <>
              {' '}
              as <span className="font-medium text-ink">{viewerFirstName}</span>
            </>
          ) : null}
          .
        </p>
        <a
          href={`#review-${existingReview.id}`}
          className="mt-4 inline-flex font-body text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          Jump to your review
        </a>
        <p className="mt-3 font-body text-xs text-ink-muted">
          Manage purchases and orders in{' '}
          <Link
            href="/account"
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            your account
          </Link>
          .
        </p>
      </div>
    );
  }

  const disabledFieldClass =
    'disabled:cursor-not-allowed disabled:bg-panel disabled:text-ink-faint';

  return (
    <div className="rounded-card border border-line bg-panel p-6">
      <h3 className="font-display text-xl tracking-[-0.01em] text-ink">
        Write a review
      </h3>

      {!canSubmit ? (
        <p
          className="mt-2 rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink-secondary"
          title={SIGN_IN_REQUIRED}
        >
          {SIGN_IN_REQUIRED}.{' '}
          <Link
            href={loginHref}
            className="font-medium text-pine underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{' '}
          to post feedback linked to your account.
        </p>
      ) : (
        <p className="mt-2 font-body text-xs text-ink-muted">
          Posting as{' '}
          <span className="font-medium text-ink">{viewerFirstName}</span>.
          Verified buyers may share feedback after a qualifying order ships.
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        {errors.root ? (
          <div className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid">
            {errors.root.message}
          </div>
        ) : null}

        <fieldset
          disabled={!canSubmit}
          className={!canSubmit ? 'opacity-55' : undefined}
        >
          <legend className="sr-only">Review fields</legend>

          <div>
            <span className="mb-2 block font-body text-micro uppercase text-ink">
              Rating
            </span>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <div
                  role="radiogroup"
                  aria-label="Star rating"
                  aria-disabled={!canSubmit}
                  className="flex gap-1"
                  title={!canSubmit ? SIGN_IN_REQUIRED : undefined}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= field.value;
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={field.value === star}
                        disabled={!canSubmit}
                        onClick={() => field.onChange(star)}
                        className="rounded-tile p-1 transition-colors duration-fast hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Star
                          size={28}
                          aria-hidden
                          className={
                            active
                              ? 'fill-amber text-amber'
                              : 'fill-transparent text-ink-faint'
                          }
                        />
                        <span className="sr-only">{star} stars</span>
                      </button>
                    );
                  })}
                </div>
              )}
            />
            <span className="sr-only" aria-live="polite">
              Selected rating {ratingValue} out of 5
            </span>
            {errors.rating ? (
              <p className="mt-1 font-body text-xs text-danger-solid">
                {errors.rating.message}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label
              htmlFor="review-title"
              className="mb-1.5 block font-body text-micro uppercase text-ink"
            >
              Title{' '}
              <span className="font-normal normal-case text-ink-faint">
                (optional)
              </span>
            </label>
            <input
              id="review-title"
              type="text"
              disabled={!canSubmit}
              title={!canSubmit ? SIGN_IN_REQUIRED : undefined}
              {...register('title')}
              maxLength={80}
              className={`w-full rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none ${disabledFieldClass}`}
              placeholder="Summarize your experience"
            />
            {errors.title ? (
              <p className="mt-1 font-body text-xs text-danger-solid">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="review-body"
                className="font-body text-micro uppercase text-ink"
              >
                Review
              </label>
              {canSubmit && isTyping && viewerFirstName ? (
                <span
                  className="font-body text-xs text-ink-muted"
                  aria-live="polite"
                >
                  Sharing as{' '}
                  <span className="font-medium text-ink">
                    {viewerFirstName}
                  </span>
                </span>
              ) : null}
            </div>
            <textarea
              id="review-body"
              disabled={!canSubmit}
              title={!canSubmit ? SIGN_IN_REQUIRED : undefined}
              {...register('body')}
              rows={5}
              className={`w-full resize-y rounded-tile border border-line bg-paper px-3 py-2 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none ${disabledFieldClass}`}
              placeholder={
                canSubmit && viewerFirstName
                  ? `What did your pet think, ${viewerFirstName}?`
                  : 'Share your experience after signing in'
              }
            />
            {errors.body ? (
              <p className="mt-1 font-body text-xs text-danger-solid">
                {errors.body.message}
              </p>
            ) : null}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          title={!canSubmit ? SIGN_IN_REQUIRED : undefined}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-5 py-3 font-body text-button uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:border-line disabled:bg-paper disabled:text-ink-faint"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            'Submit review'
          )}
        </button>
      </form>
    </div>
  );
}
