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
import {
  classifyReviewMutationError,
  createProductReview,
} from '@/lib/api/reviews';

interface ReviewFormProps {
  slug: string;
}

export function ReviewForm({ slug }: ReviewFormProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

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

  const onSubmit = handleSubmit(async (data) => {
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
          message:
            'You must be signed in to post a review. Sign in and try again.',
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

  const loginHref = `/login?redirect=${encodeURIComponent(`/products/${slug}#reviews`)}`;

  if (loading) {
    return (
      <div className="rounded-xl border border-warm-200 bg-warm-50 p-6 font-body text-sm text-warm-600">
        Checking sign-in status…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-warm-200 bg-surface-card p-6 shadow-sm">
        <h3 className="font-display text-lg tracking-[-0.02em] text-warm-900">
          Write a review
        </h3>
        <p className="mt-2 font-body text-sm text-warm-600">
          Share how this product worked for your pet.{' '}
          <Link
            href={loginHref}
            className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            Sign in
          </Link>{' '}
          to leave your rating.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-warm-200 bg-surface-card p-6 shadow-sm">
      <h3 className="font-display text-lg tracking-[-0.02em] text-warm-900">
        Write a review
      </h3>
      <p className="text-warm-500 mt-1 font-body text-xs">
        Verified buyers may share detailed feedback once their order is
        delivered.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        {errors.root ? (
          <div className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
            {errors.root.message}
          </div>
        ) : null}

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
                className="flex gap-1"
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= field.value;
                  return (
                    <button
                      key={star}
                      type="button"
                      role="radio"
                      aria-checked={field.value === star}
                      onClick={() => field.onChange(star)}
                      className="rounded-md p-1 transition-colors hover:bg-warm-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
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

        <div>
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
            {...register('title')}
            maxLength={80}
            className="w-full rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Summarize your experience"
          />
          {errors.title ? (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="review-body"
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
          >
            Review
          </label>
          <textarea
            id="review-body"
            {...register('body')}
            rows={5}
            className="w-full resize-y rounded-lg border border-warm-300 bg-surface-card px-3 py-2 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="What did your pet think? Packaging, ingredients, shipping…"
          />
          {errors.body ? (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.body.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
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
