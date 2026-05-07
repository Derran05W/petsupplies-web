'use client';

import { useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { settingsSchema, type SettingsInput } from '@/lib/account/schemas';
import { cn } from '@/lib/utils';

interface SettingsFormProps {
  initialName: string;
  initialEmail: string;
}

const inputBase =
  'w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-9 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400';
const inputError = 'border-red-400 focus:ring-red-400';
const labelBase =
  'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600';

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

/**
 * Account settings form: update display name and request an email
 * change. Calls Supabase Auth directly from the browser (the cookie
 * session is browser-side; there's no backend hop). Email changes go
 * through Supabase's built-in confirmation flow — the user sees a
 * "Check your inbox" panel until they click the confirmation link in
 * the new mailbox (and, for paranoid setups, also the old one).
 */
export function SettingsForm({ initialName, initialEmail }: SettingsFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [emailChangeRequested, setEmailChangeRequested] = useState<
    string | null
  >(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: initialName, email: initialEmail },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root');
    setProfileSaved(false);
    setSubmitting(true);

    const supabase = createClient();
    const nameChanged = values.name.trim() !== initialName.trim();
    const emailChanged =
      values.email.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

    try {
      if (nameChanged) {
        const { error } = await supabase.auth.updateUser({
          data: { name: values.name.trim() },
        });
        if (error) {
          setError('root', { message: error.message });
          return;
        }
      }

      if (emailChanged) {
        const { error } = await supabase.auth.updateUser({
          email: values.email.trim(),
        });
        if (error) {
          setError('root', { message: error.message });
          return;
        }
        setEmailChangeRequested(values.email.trim());
        return;
      }

      if (nameChanged) {
        setProfileSaved(true);
        // Reset the form's "dirty" baseline to the new name so a follow
        // -up submit doesn't re-send the same `updateUser` payload.
        reset({ name: values.name.trim(), email: values.email.trim() });
        // Refresh the RSC tree so any server-rendered surface that
        // reads `user.user_metadata.name` (e.g. the account sidebar
        // avatar / header) sees the new value.
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  });

  if (emailChangeRequested) {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-warm-200 bg-white p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600"
          >
            <Mail size={18} />
          </span>
          <h2 className="font-display text-2xl tracking-[-0.02em] text-warm-900">
            Check your inbox
          </h2>
        </div>
        <p className="font-body text-sm leading-relaxed text-warm-600">
          We sent a confirmation link to{' '}
          <span className="font-medium text-warm-900">
            {emailChangeRequested}
          </span>
          . Click it to finish updating your email address. Depending on your
          settings, you may also need to confirm from your previous inbox.
        </p>
        <button
          type="button"
          onClick={() => setEmailChangeRequested(null)}
          className="self-start font-body text-sm font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          Back to settings
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-8 rounded-2xl border border-warm-200 bg-white p-6 md:p-8"
    >
      {errors.root && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700"
        >
          {errors.root.message}
        </div>
      )}

      {profileSaved && (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex items-center gap-2 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 font-body text-sm text-brand-700"
        >
          <CheckCircle2 size={14} aria-hidden />
          Profile updated.
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg tracking-[-0.02em] text-warm-900">
          Profile
        </legend>
        <div>
          <label htmlFor="name" className={labelBase}>
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
              placeholder="Jane Smith"
              {...register('name')}
              {...fieldErrorProps('name', errors.name)}
              className={cn(inputBase, errors.name && inputError)}
            />
          </div>
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="mt-1 font-body text-xs text-red-600"
            >
              {errors.name.message}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg tracking-[-0.02em] text-warm-900">
          Email
        </legend>
        <div>
          <label htmlFor="email" className={labelBase}>
            Email address
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
              placeholder="you@example.com"
              {...register('email')}
              {...fieldErrorProps('email', errors.email)}
              className={cn(inputBase, errors.email && inputError)}
            />
          </div>
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 font-body text-xs text-red-600"
            >
              {errors.email.message}
            </p>
          )}
          <p className="mt-2 font-body text-xs text-warm-600">
            We&apos;ll email a confirmation link to your new address before the
            change takes effect.
          </p>
        </div>
      </fieldset>

      <div className="flex">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && (
            <Loader2 size={14} aria-hidden className="animate-spin" />
          )}
          Save changes
        </button>
      </div>

      <p className="border-t border-warm-200 pt-4 font-body text-xs text-warm-600">
        Need to change your password? Use the{' '}
        <a
          href="/login"
          className="font-medium text-brand-600 underline-offset-2 hover:text-brand-700 hover:underline"
        >
          sign-in page
        </a>{' '}
        to request a reset link.
      </p>
    </form>
  );
}
