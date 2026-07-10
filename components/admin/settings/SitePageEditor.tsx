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
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading page…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  if (!page) {
    return (
      <p className="font-body text-sm text-ink-secondary">
        Unknown page slug.{' '}
        <Link
          href="/admin/settings/pages"
          className="text-ink underline transition-opacity duration-fast hover:opacity-70"
        >
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
            <p className="font-mono text-sm text-ink-secondary">/{slug}</p>
            <p className="mt-1 font-body text-xs text-ink-faint">
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

          <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            />
            Published on storefront
          </label>

          {submitError ? (
            <p className="font-body text-sm text-danger-solid" role="alert">
              {submitError}
            </p>
          ) : null}
          {success ? (
            <p className="font-body text-sm text-pine" role="status">
              {success}
            </p>
          ) : null}

          <div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="rounded-card border border-line bg-panel p-6">
            <h2 className="mb-4 font-display text-2xl tracking-[-0.01em] text-ink">
              {title.trim() || 'Untitled'}
            </h2>
            {bodyMarkdown.trim().length > 0 ? (
              <MarkdownContent markdown={bodyMarkdown} />
            ) : (
              <p className="font-body text-sm italic text-ink-muted">
                Nothing to preview yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
