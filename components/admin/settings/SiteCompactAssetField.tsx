'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, UploadCloud } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { imageUploadErrorMessage } from '@/lib/api/admin/error-messages';
import { uploadSiteAssetFile } from '@/lib/api/admin/site-assets';
import { settingsInputBase } from './admin-settings-form-styles';

interface SiteCompactAssetFieldProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label: string;
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function SiteCompactAssetField({
  value,
  onChange,
  disabled = false,
  label,
}: SiteCompactAssetFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = value.trim().length > 0 ? value : null;
  const isRemote = previewSrc?.startsWith('http') ?? false;

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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {previewSrc ? (
          <span className="relative size-10 shrink-0 overflow-hidden rounded-tile border border-line bg-panel">
            <Image
              src={previewSrc}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized={isRemote}
            />
          </span>
        ) : null}
        <input
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Image URL (optional)"
          className={settingsInputBase}
        />
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-pill border border-ink bg-transparent px-3 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" aria-hidden />
          ) : (
            <UploadCloud size={12} aria-hidden />
          )}
          Upload
        </button>
        <input
          ref={inputRef}
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
      {error ? (
        <p className="font-body text-xs text-danger-solid" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
