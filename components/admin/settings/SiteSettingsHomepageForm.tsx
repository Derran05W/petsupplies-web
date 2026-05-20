'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { BrandValue } from '@/types/site';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from '@/hooks/useSiteSettings';
import { BRAND_VALUE_ICON_OPTIONS } from '@/lib/site/brand-value-icons';
import { SiteHeroImageField } from './SiteHeroImageField';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';
import { cn } from '@/lib/utils';

interface HomepageFormValues {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;
  heroImageUrl: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  brandValues: BrandValue[];
}

export function SiteSettingsHomepageForm() {
  const { data, isPending, error: loadError } = useSiteSettingsQuery();
  const mutation = useUpdateSiteSettingsMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<HomepageFormValues>({
    defaultValues: {
      heroEyebrow: '',
      heroHeadline: '',
      heroSubhead: '',
      heroImageUrl: '',
      heroPrimaryCtaLabel: '',
      heroPrimaryCtaHref: '',
      heroSecondaryCtaLabel: '',
      heroSecondaryCtaHref: '',
      brandValues: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'brandValues',
  });

  const heroImageUrl = watch('heroImageUrl');

  useEffect(() => {
    if (!data) return;
    reset({
      heroEyebrow: data.heroEyebrow,
      heroHeadline: data.heroHeadline,
      heroSubhead: data.heroSubhead,
      heroImageUrl: data.heroImageUrl,
      heroPrimaryCtaLabel: data.heroPrimaryCtaLabel,
      heroPrimaryCtaHref: data.heroPrimaryCtaHref,
      heroSecondaryCtaLabel: data.heroSecondaryCtaLabel,
      heroSecondaryCtaHref: data.heroSecondaryCtaHref,
      brandValues: data.brandValues.slice(0, 3),
    });
  }, [data, reset]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading homepage settings…
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
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(async (values) => {
        setSubmitError(null);
        setSuccess(null);

        if (values.brandValues.length > 3) {
          setSubmitError('Brand values are limited to 3 cards.');
          return;
        }

        try {
          await mutation.mutateAsync({
            heroEyebrow: values.heroEyebrow.trim(),
            heroHeadline: values.heroHeadline.trim(),
            heroSubhead: values.heroSubhead.trim(),
            heroImageUrl: values.heroImageUrl.trim(),
            heroPrimaryCtaLabel: values.heroPrimaryCtaLabel.trim(),
            heroPrimaryCtaHref: values.heroPrimaryCtaHref.trim(),
            heroSecondaryCtaLabel: values.heroSecondaryCtaLabel.trim(),
            heroSecondaryCtaHref: values.heroSecondaryCtaHref.trim(),
            brandValues: values.brandValues.map((item) => ({
              title: item.title.trim(),
              body: item.body.trim(),
              ...(item.icon ? { icon: item.icon } : {}),
            })),
          });
          setSuccess(settingsSuccessMessage);
        } catch (err) {
          setSubmitError(adminApiErrorMessage(err));
        }
      })}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <SiteHeroImageField
            value={heroImageUrl}
            onChange={(url) =>
              setValue('heroImageUrl', url, { shouldDirty: true })
            }
            disabled={mutation.isPending}
          />
        </div>

        <div>
          <label htmlFor="hero-eyebrow" className={settingsLabelBase}>
            Eyebrow
          </label>
          <input
            id="hero-eyebrow"
            className={settingsInputBase}
            {...register('heroEyebrow', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="hero-headline" className={settingsLabelBase}>
            Headline
          </label>
          <input
            id="hero-headline"
            className={settingsInputBase}
            {...register('heroHeadline', { required: true })}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="hero-subhead" className={settingsLabelBase}>
            Subhead
          </label>
          <textarea
            id="hero-subhead"
            rows={2}
            className={cn(settingsInputBase, 'resize-y')}
            {...register('heroSubhead', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="hero-primary-label" className={settingsLabelBase}>
            Primary CTA label
          </label>
          <input
            id="hero-primary-label"
            className={settingsInputBase}
            {...register('heroPrimaryCtaLabel', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="hero-primary-href" className={settingsLabelBase}>
            Primary CTA link
          </label>
          <input
            id="hero-primary-href"
            className={settingsInputBase}
            {...register('heroPrimaryCtaHref', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="hero-secondary-label" className={settingsLabelBase}>
            Secondary CTA label
          </label>
          <input
            id="hero-secondary-label"
            className={settingsInputBase}
            {...register('heroSecondaryCtaLabel', { required: true })}
          />
        </div>

        <div>
          <label htmlFor="hero-secondary-href" className={settingsLabelBase}>
            Secondary CTA link
          </label>
          <input
            id="hero-secondary-href"
            className={settingsInputBase}
            {...register('heroSecondaryCtaHref', { required: true })}
          />
        </div>
      </div>

      <div className="border-t border-warm-200 pt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl tracking-[-0.02em] text-warm-900">
              Brand values
            </h3>
            <p className="mt-1 font-body text-sm text-warm-600">
              Up to three cards shown below featured products on the homepage.
            </p>
          </div>
          <button
            type="button"
            disabled={fields.length >= 3 || mutation.isPending}
            onClick={() => append({ title: '', body: '', icon: 'truck' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-warm-300 px-3 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={14} aria-hidden />
            Add card
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-warm-50/50 rounded-lg border border-warm-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-body text-sm font-medium text-warm-900">
                  Card {index + 1}
                </p>
                <button
                  type="button"
                  aria-label={`Remove brand value card ${index + 1}`}
                  onClick={() => remove(index)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-warm-600 transition-colors hover:bg-warm-100 hover:text-red-700"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`brand-value-title-${index}`}
                    className={settingsLabelBase}
                  >
                    Title
                  </label>
                  <input
                    id={`brand-value-title-${index}`}
                    className={settingsInputBase}
                    {...register(`brandValues.${index}.title` as const, {
                      required: true,
                    })}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`brand-value-icon-${index}`}
                    className={settingsLabelBase}
                  >
                    Icon
                  </label>
                  <select
                    id={`brand-value-icon-${index}`}
                    className={settingsInputBase}
                    {...register(`brandValues.${index}.icon` as const)}
                  >
                    {BRAND_VALUE_ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={`brand-value-body-${index}`}
                    className={settingsLabelBase}
                  >
                    Body
                  </label>
                  <textarea
                    id={`brand-value-body-${index}`}
                    rows={2}
                    className={cn(settingsInputBase, 'resize-y')}
                    {...register(`brandValues.${index}.body` as const, {
                      required: true,
                    })}
                  />
                </div>
              </div>
            </div>
          ))}

          {fields.length === 0 ? (
            <p className="text-warm-500 font-body text-sm">
              No brand value cards yet. Add up to three.
            </p>
          ) : null}
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
          Save homepage
        </button>
      </div>
    </form>
  );
}
