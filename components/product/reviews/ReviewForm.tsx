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
      <div className="rounded-xl border border-warm-200 bg-warm-50 p-6 font-body text-sm text-warm-600">
        Checking sign-in status…
      </div>
    );
  }

  if (existingReview && user) {
    return (
      <div className="rounded-xl border border-warm-200 bg-surface-card p-6 shadow-sm">
        <h3 className="font-display text-lg tracking-[-0.02em] text-warm-900">
          Your review
        </h3>
        <p className="mt-2 font-body text-sm text-warm-600">
          You already shared feedback for this product
          {viewerFirstName ? (
            <>
              {' '}
              as{' '}
              <span className="font-medium text-warm-900">
                {viewerFirstName}
              </span>
            </>
          ) : null}
          .
        </p>
        <a
          href={`#review-${existingReview.id}`}
          className="mt-4 inline-flex font-body text-sm font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          Jump to your review
        </a>
        <p className="text-warm-500 mt-3 font-body text-xs">
          Manage purchases and orders in{' '}
          <Link
            href="/account"
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            your account
          </Link>
          .
        </p>
      </div>
    );
  }

  const disabledFieldClass =
    'disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-400';

  return (
    <div className="rounded-xl border border-warm-200 bg-surface-card p-6 shadow-sm">
      <h3 className="font-display text-lg tracking-[-0.02em] text-warm-900">
        Write a review
      </h3>

      {!canSubmit ? (
        <p
          className="mt-2 rounded-md border border-warm-200 bg-warm-50 px-3 py-2 font-body text-sm text-warm-600"
          title={SIGN_IN_REQUIRED}
        >
          {SIGN_IN_REQUIRED}.{' '}
          <Link
            href={loginHref}
            className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            Sign in
          </Link>{' '}
          to post feedback linked to your account.
        </p>
      ) : (
        <p className="text-warm-500 mt-2 font-body text-xs">
          Posting as{' '}
          <span className="text-warm-700 font-medium">{viewerFirstName}</span>.
          Verified buyers may share feedback after a qualifying order ships.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-5 space-y-4"
        aria-disabled={!canSubmit}
      >
        {errors.root ? (
          <div className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
            {errors.root.message}
          </div>
        ) : null}

        <fieldset
          disabled={!canSubmit}
          className={!canSubmit ? 'opacity-55' : undefined}
        >
          <legend className="sr-only">Review fields</legend>

          <div>
            <span className="mb-2 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
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
                        className="rounded-md p-1 transition-colors hover:bg-warm-50 focus:outline-none focus:ring-2 focus:ring-brand-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        <Star
                          size={28}
                          aria-hidden
                          className={
                            active
                              ? 'fill-brand-400 text-brand-400'
                              : 'fill-transparent text-warm-200'
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
              <p className="mt-1 font-body text-xs text-red-600">
                {errors.rating.message}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <label
              htmlFor="review-title"
              className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
            >
              Title{' '}
              <span className="font-normal normal-case text-warm-400">
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
              className={`w-full rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400 ${disabledFieldClass}`}
              placeholder="Summarize your experience"
            />
            {errors.title ? (
              <p className="mt-1 font-body text-xs text-red-600">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <label
                htmlFor="review-body"
                className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
              >
                Review
              </label>
              {canSubmit && isTyping && viewerFirstName ? (
                <span
                  className="text-warm-500 font-body text-xs"
                  aria-live="polite"
                >
                  Sharing as{' '}
                  <span className="text-warm-800 font-medium">
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
              className={`w-full resize-y rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400 ${disabledFieldClass}`}
              placeholder={
                canSubmit && viewerFirstName
                  ? `What did your pet think, ${viewerFirstName}?`
                  : 'Share your experience after signing in'
              }
            />
            {errors.body ? (
              <p className="mt-1 font-body text-xs text-red-600">
                {errors.body.message}
              </p>
            ) : null}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          title={!canSubmit ? SIGN_IN_REQUIRED : undefined}
          className="disabled:text-warm-500 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-warm-300"
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
