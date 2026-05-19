'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/auth/schemas';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { GoogleButton } from './GoogleButton';
import { AppleButton } from './AppleButton';
import Link from 'next/link';
import { brand } from '@/lib/config/brand';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') ?? '/account';
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);
    if (error) {
      setError('root', { message: error.message });
      return;
    }
    router.replace(redirectTarget);
    router.refresh();
  });

  return (
    <AuthCard
      heading="Welcome back"
      subtext={`Sign in to your ${brand.name} account`}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {errors.root && (
          <div className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

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
              className="w-full rounded-lg border border-warm-300 bg-surface-card py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
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
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-lg border border-warm-300 bg-surface-card py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="••••••••"
            />
          </div>
          {errors.password && (
            <p className="mt-1 font-body text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Sign in
        </button>
      </form>

      <AuthDivider />
      <div className="flex flex-col gap-3">
        <GoogleButton redirectTarget={redirectTarget} />
        <AppleButton redirectTarget={redirectTarget} />
      </div>

      <p className="mt-6 text-center font-body text-sm text-warm-600">
        New to {brand.name}?{' '}
        <Link
          href="/signup"
          className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
