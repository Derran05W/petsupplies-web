'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/auth/schemas';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { GoogleButton } from './GoogleButton';
import { AppleButton } from './AppleButton';
import Link from 'next/link';
import { brand } from '@/lib/config/brand';

export function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') ?? '/account';
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTarget)}`,
      },
    });
    setSubmitting(false);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    // Email confirmation required: session is null until confirmed
    if (data.user && !data.session) {
      setCheckEmail(true);
    }
  });

  if (checkEmail) {
    return (
      <AuthCard heading="Check your email">
        <p className="font-body text-sm leading-relaxed text-warm-600">
          We sent a confirmation link to your email address. Click it to
          activate your account and you&apos;ll be signed in automatically.
        </p>
        <p className="mt-4 font-body text-sm text-warm-600">
          Already confirmed?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Create an account"
      subtext={`Join ${brand.name} for faster checkout and order history`}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {errors.root && (
          <div className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
          >
            Full name
          </label>
          <div className="relative">
            <User
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Jane Smith"
            />
          </div>
          {errors.name && (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="At least 8 characters"
            />
          </div>
          {errors.password && (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
              className="w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="••••••••"
            />
          </div>
          {errors.confirm && (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.confirm.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </form>

      <AuthDivider />
      <div className="flex flex-col gap-3">
        <GoogleButton redirectTarget={redirectTarget} />
        <AppleButton redirectTarget={redirectTarget} />
      </div>

      <p className="mt-6 text-center font-body text-sm text-warm-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
