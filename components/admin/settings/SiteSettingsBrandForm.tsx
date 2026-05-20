'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from '@/hooks/useSiteSettings';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from '@/components/admin/settings/admin-settings-form-styles';
import { cn } from '@/lib/utils';

interface BrandFormValues {
  brandName: string;
  tagline: string;
  description: string;
  logoAccentWords: string;
  supportEmail: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTwitter: string;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function SiteSettingsBrandForm() {
  const { data, isPending, error: loadError } = useSiteSettingsQuery();
  const mutation = useUpdateSiteSettingsMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<BrandFormValues>({
    defaultValues: {
      brandName: '',
      tagline: '',
      description: '',
      logoAccentWords: '1',
      supportEmail: '',
      socialInstagram: '',
      socialFacebook: '',
      socialTwitter: '',
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      brandName: data.brandName,
      tagline: data.tagline,
      description: data.description,
      logoAccentWords: String(data.logoAccentWords),
      supportEmail: data.supportEmail,
      socialInstagram: data.socialInstagram ?? '',
      socialFacebook: data.socialFacebook ?? '',
      socialTwitter: data.socialTwitter ?? '',
    });
  }, [data, reset]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading brand settings…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-red-700" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        setSuccess(null);

        const logoAccentWords = Number.parseInt(values.logoAccentWords, 10);
        if (!Number.isFinite(logoAccentWords) || logoAccentWords < 1) {
          setSubmitError('Logo accent words must be at least 1.');
          return;
        }

        try {
          await mutation.mutateAsync({
            brandName: values.brandName.trim(),
            tagline: values.tagline.trim(),
            description: values.description.trim(),
            logoAccentWords,
            supportEmail: values.supportEmail.trim(),
            socialInstagram: emptyToNull(values.socialInstagram),
            socialFacebook: emptyToNull(values.socialFacebook),
            socialTwitter: emptyToNull(values.socialTwitter),
          });
          setSuccess(settingsSuccessMessage);
        } catch (err) {
          setSubmitError(adminApiErrorMessage(err));
        }
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="brand-name" className={settingsLabelBase}>
            Store name
          </label>
          <input
            id="brand-name"
            className={settingsInputBase}
            {...register('brandName', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="brand-tagline" className={settingsLabelBase}>
            Tagline
          </label>
          <input
            id="brand-tagline"
            className={settingsInputBase}
            {...register('tagline', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="logo-accent-words" className={settingsLabelBase}>
            Logo accent words
          </label>
          <input
            id="logo-accent-words"
            type="number"
            min={1}
            className={settingsInputBase}
            {...register('logoAccentWords', { required: true })}
          />
          <p className="text-warm-500 mt-1.5 font-body text-xs">
            How many leading words in the store name use the accent colour in
            the navbar.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="brand-description" className={settingsLabelBase}>
            Description
          </label>
          <textarea
            id="brand-description"
            rows={3}
            className={cn(settingsInputBase, 'resize-y')}
            {...register('description', { required: true })}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="support-email" className={settingsLabelBase}>
            Support email
          </label>
          <input
            id="support-email"
            type="email"
            className={settingsInputBase}
            {...register('supportEmail', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="social-instagram" className={settingsLabelBase}>
            Instagram URL
          </label>
          <input
            id="social-instagram"
            type="url"
            placeholder="https://instagram.com/…"
            className={settingsInputBase}
            {...register('socialInstagram')}
          />
        </div>

        <div>
          <label htmlFor="social-facebook" className={settingsLabelBase}>
            Facebook URL
          </label>
          <input
            id="social-facebook"
            type="url"
            placeholder="https://facebook.com/…"
            className={settingsInputBase}
            {...register('socialFacebook')}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="social-twitter" className={settingsLabelBase}>
            X / Twitter URL
          </label>
          <input
            id="social-twitter"
            type="url"
            placeholder="https://x.com/…"
            className={settingsInputBase}
            {...register('socialTwitter')}
          />
        </div>
      </div>

      {submitError ? (
        <p className="font-body text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-brand-700" role="status">
          {success}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          disabled={!isDirty || mutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : null}
          Save brand
        </button>
      </div>
    </form>
  );
}
