'use client';

import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  resolvePostLoginPath,
  withAuthRedirectQuery,
} from '@/lib/auth/post-login-redirect';
import { loginSchema, type LoginInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { GoogleButton } from './GoogleButton';
import { AppleButton } from './AppleButton';
import Link from 'next/link';
import { brand } from '@/lib/config/brand';

const inputBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

function fieldErrorProps(id: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${id}-error`,
  };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = resolvePostLoginPath(searchParams.get('redirect'));
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
          <div
            role="alert"
            className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid"
          >
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelBase}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            {...fieldErrorProps('email', errors.email)}
            className={cn(inputBase, errors.email && inputError)}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className={labelBase}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password')}
            {...fieldErrorProps('password', errors.password)}
            className={cn(inputBase, errors.password && inputError)}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <Loader2
              size={16}
              aria-hidden
              className="mr-2 inline animate-spin align-[-2px]"
            />
          )}
          Sign in
        </Button>
      </form>

      <AuthDivider />
      <div className="flex flex-col gap-3">
        <GoogleButton redirectTarget={redirectTarget} />
        <AppleButton redirectTarget={redirectTarget} />
      </div>

      <p className="mt-6 text-center font-body text-sm text-ink-secondary">
        New to {brand.name}?{' '}
        <Link
          href={withAuthRedirectQuery('/signup', searchParams.get('redirect'))}
          className="font-medium text-pine underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
