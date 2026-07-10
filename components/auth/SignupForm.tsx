'use client';

import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  resolvePostLoginPath,
  withAuthRedirectQuery,
} from '@/lib/auth/post-login-redirect';
import { signupSchema, type SignupInput } from '@/lib/auth/schemas';
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

export function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTarget = resolvePostLoginPath(searchParams.get('redirect'));
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
        <p className="font-body text-sm leading-body text-ink-secondary">
          We sent a confirmation link to your email address. Click it to
          activate your account and you&apos;ll be signed in automatically.
        </p>
        <p className="mt-4 font-body text-sm text-ink-secondary">
          Already confirmed?{' '}
          <Link
            href={withAuthRedirectQuery('/login', searchParams.get('redirect'))}
            className="font-medium text-pine underline-offset-2 hover:underline"
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
          <div
            role="alert"
            className="rounded-tile border border-danger-border bg-danger-surface px-3 py-2 font-body text-sm text-danger-solid"
          >
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="name" className={labelBase}>
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            {...register('name')}
            {...fieldErrorProps('name', errors.name)}
            className={cn(inputBase, errors.name && inputError)}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.name.message}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="At least 8 characters"
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

        <div>
          <label htmlFor="confirm" className={labelBase}>
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirm')}
            {...fieldErrorProps('confirm', errors.confirm)}
            className={cn(inputBase, errors.confirm && inputError)}
          />
          {errors.confirm && (
            <p
              id="confirm-error"
              role="alert"
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.confirm.message}
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
          Create account
        </Button>
      </form>

      <AuthDivider />
      <div className="flex flex-col gap-3">
        <GoogleButton redirectTarget={redirectTarget} />
        <AppleButton redirectTarget={redirectTarget} />
      </div>

      <p className="mt-6 text-center font-body text-sm text-ink-secondary">
        Already have an account?{' '}
        <Link
          href={withAuthRedirectQuery('/login', searchParams.get('redirect'))}
          className="font-medium text-pine underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
