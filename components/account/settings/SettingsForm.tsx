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
  'w-full rounded-tile border border-line bg-paper py-2.5 pl-9 pr-3 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

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
      <section className="flex flex-col gap-4 rounded-card border border-line bg-paper p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-tile bg-tile-sage text-tile-sage-ink"
          >
            <Mail size={18} />
          </span>
          <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
            Check your inbox
          </h2>
        </div>
        <p className="font-body text-sm leading-body text-ink-secondary">
          We sent a confirmation link to{' '}
          <span className="font-medium text-ink">{emailChangeRequested}</span>.
          Click it to finish updating your email address. Depending on your
          settings, you may also need to confirm from your previous inbox.
        </p>
        <button
          type="button"
          onClick={() => setEmailChangeRequested(null)}
          className="self-start border-b border-ink pb-0.5 font-body text-micro uppercase text-ink transition-opacity duration-fast hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
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
      className="flex flex-col gap-8 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      {errors.root && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
        >
          {errors.root.message}
        </div>
      )}

      {profileSaved && (
        <div
          role="status"
          aria-live="polite"
          className="border-pine/40 inline-flex items-center gap-2 rounded-tile border bg-tile-sage px-4 py-3 font-body text-sm text-tile-sage-ink"
        >
          <CheckCircle2 size={14} aria-hidden />
          Profile updated.
        </div>
      )}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg tracking-[-0.01em] text-ink">
          Profile
        </legend>
        <div>
          <label htmlFor="name" className={labelBase}>
            Full name
          </label>
          <div className="relative">
            <User
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
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
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.name.message}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 font-display text-lg tracking-[-0.01em] text-ink">
          Email
        </legend>
        <div>
          <label htmlFor="email" className={labelBase}>
            Email address
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
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
              className="mt-1 font-body text-xs text-danger-solid"
            >
              {errors.email.message}
            </p>
          )}
          <p className="mt-2 font-body text-xs text-ink-muted">
            We&apos;ll email a confirmation link to your new address before the
            change takes effect.
          </p>
        </div>
      </fieldset>

      <div className="flex">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <Loader2 size={14} aria-hidden className="animate-spin" />
          )}
          Save changes
        </button>
      </div>

      <p className="border-t border-line pt-4 font-body text-xs text-ink-muted">
        Need to change your password? Use the{' '}
        <a
          href="/login"
          className="font-medium text-pine underline-offset-2 hover:underline"
        >
          sign-in page
        </a>{' '}
        to request a reset link.
      </p>
    </form>
  );
}
