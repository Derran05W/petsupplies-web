'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { MarkdownContent } from '@/components/content/MarkdownContent';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useAdminSitePagesQuery,
  useUpsertSitePageMutation,
} from '@/hooks/useAdminSitePages';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from '@/components/admin/settings/admin-settings-form-styles';
import { staticPageLabel } from '@/lib/site/static-pages';
import type { StaticPageSlug } from '@/types/site';

interface SitePageEditorProps {
  slug: StaticPageSlug;
}

export function SitePageEditor({ slug }: SitePageEditorProps) {
  const { data, isPending, error: loadError } = useAdminSitePagesQuery();
  const mutation = useUpsertSitePageMutation();
  const page = data?.pages.find((p) => p.slug === slug);

  const [title, setTitle] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!page) return;
    setTitle(page.title);
    setBodyMarkdown(page.bodyMarkdown);
    setIsPublished(page.isPublished);
  }, [page]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading page…
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

  if (!page) {
    return (
      <p className="font-body text-sm text-warm-600">
        Unknown page slug.{' '}
        <Link href="/admin/settings/pages" className="text-brand-600 underline">
          Back to pages
        </Link>
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitError(null);
        setSuccess(null);

        const trimmedTitle = title.trim();
        if (trimmedTitle.length === 0) {
          setSubmitError('Title is required.');
          return;
        }

        try {
          await mutation.mutateAsync({
            slug,
            body: {
              title: trimmedTitle,
              bodyMarkdown,
              isPublished,
            },
          });
          setSuccess(settingsSuccessMessage);
        } catch (err) {
          setSubmitError(adminApiErrorMessage(err));
        }
      }}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div>
            <span className={settingsLabelBase}>Slug</span>
            <p className="text-warm-800 font-mono text-sm">/{slug}</p>
            <p className="text-warm-500 mt-1 font-body text-xs">
              {staticPageLabel(slug)} — route is fixed; only content is
              editable.
            </p>
          </div>

          <div>
            <label htmlFor="page-title" className={settingsLabelBase}>
              Title
            </label>
            <input
              id="page-title"
              className={settingsInputBase}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="page-body" className={settingsLabelBase}>
              Body (Markdown)
            </label>
            <textarea
              id="page-body"
              rows={16}
              className={settingsInputBase}
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
            />
          </div>

          <label className="text-warm-800 flex cursor-pointer items-center gap-2 font-body text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded border-warm-300 text-brand-400 focus:ring-brand-400"
            />
            Published on storefront
          </label>

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
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : null}
              Save page
            </button>
          </div>
        </div>

        <div>
          <h3 className={settingsLabelBase}>Preview</h3>
          <div className="rounded-xl border border-warm-200 bg-warm-50 p-6">
            <h2 className="mb-4 font-display text-2xl tracking-[-0.02em] text-warm-900">
              {title.trim() || 'Untitled'}
            </h2>
            {bodyMarkdown.trim().length > 0 ? (
              <MarkdownContent markdown={bodyMarkdown} />
            ) : (
              <p className="text-warm-500 font-body text-sm italic">
                Nothing to preview yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
