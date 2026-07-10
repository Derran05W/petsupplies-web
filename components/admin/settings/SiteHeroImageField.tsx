'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { imageUploadErrorMessage } from '@/lib/api/admin/error-messages';
import { uploadSiteAssetFile } from '@/lib/api/admin/site-assets';
import {
  settingsInputBase,
  settingsLabelBase,
} from './admin-settings-form-styles';

interface SiteHeroImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function SiteHeroImageField({
  value,
  onChange,
  disabled = false,
}: SiteHeroImageFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const helpId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc =
    value.trim().length > 0 ? value : '/images/hero-placeholder.jpg';
  const isRemote = previewSrc.startsWith('http');

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const accessToken = await getBrowserAccessToken();
      const publicUrl = await uploadSiteAssetFile(file, {
        ...(accessToken ? { accessToken } : {}),
      });
      onChange(publicUrl);
    } catch (err) {
      setError(imageUploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={`${helpId}-file`} className={settingsLabelBase}>
        Hero image
      </label>

      <div className="relative aspect-[4/3] max-w-md overflow-hidden rounded-tile border border-line bg-panel">
        <Image
          src={previewSrc}
          alt="Hero preview"
          fill
          className="object-cover"
          sizes="400px"
          unoptimized={isRemote}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink bg-transparent px-4 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <UploadCloud size={14} aria-hidden />
          )}
          Upload image
        </button>
        <input
          ref={inputRef}
          id={`${helpId}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = '';
          }}
        />
      </div>

      <div>
        <label htmlFor={`${helpId}-url`} className={settingsLabelBase}>
          Image URL
        </label>
        <input
          id={`${helpId}-url`}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/hero-placeholder.jpg"
          className={settingsInputBase}
        />
        <p id={helpId} className="mt-1.5 font-body text-xs text-ink-faint">
          Upload to Supabase or paste a site-relative path. Requires the{' '}
          <code className="text-ink-secondary">site-assets</code> bucket in
          prod.
        </p>
      </div>

      {error ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
