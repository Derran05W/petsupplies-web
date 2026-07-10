'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { MarkdownContent } from '@/components/content/MarkdownContent';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useAdminEmailTemplateQuery,
  useUpsertEmailTemplateMutation,
} from '@/hooks/useAdminEmailTemplates';
import {
  settingsInputBase,
  settingsLabelBase,
} from '@/components/admin/settings/admin-settings-form-styles';
import {
  allowedVarsForTemplate,
  emailTemplateLabel,
  type EmailTemplateKey,
} from '@/lib/site/email-template-vars';

interface EmailTemplateEditorProps {
  templateKey: EmailTemplateKey;
}

export function EmailTemplateEditor({ templateKey }: EmailTemplateEditorProps) {
  const {
    data,
    isPending,
    error: loadError,
  } = useAdminEmailTemplateQuery(templateKey);
  const mutation = useUpsertEmailTemplateMutation();

  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setSubject(data.subject);
    setPreheader(data.preheader ?? '');
    setBodyMarkdown(data.bodyMarkdown);
  }, [data]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading template…
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

  const allowedVars = allowedVarsForTemplate(templateKey);

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_240px]"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitError(null);
        setSuccess(null);

        const trimmedSubject = subject.trim();
        if (trimmedSubject.length === 0) {
          setSubmitError('Subject is required.');
          return;
        }

        try {
          await mutation.mutateAsync({
            key: templateKey,
            body: {
              subject: trimmedSubject,
              preheader: preheader.trim().length > 0 ? preheader.trim() : null,
              bodyMarkdown,
            },
          });
          setSuccess(
            'Template saved. The next outgoing email will use this copy.',
          );
        } catch (err) {
          setSubmitError(adminApiErrorMessage(err));
        }
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <span className={settingsLabelBase}>Template</span>
          <p className="font-body text-sm font-medium text-ink">
            {emailTemplateLabel(templateKey)}
          </p>
          <p className="mt-1 font-mono text-xs text-ink-faint">{templateKey}</p>
        </div>

        <div>
          <label htmlFor="email-subject" className={settingsLabelBase}>
            Subject
          </label>
          <input
            id="email-subject"
            className={settingsInputBase}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email-preheader" className={settingsLabelBase}>
            Preheader (optional)
          </label>
          <input
            id="email-preheader"
            className={settingsInputBase}
            value={preheader}
            onChange={(e) => setPreheader(e.target.value)}
          />
          <p className="mt-1.5 font-body text-xs text-ink-faint">
            Short preview text shown in some inbox clients.
          </p>
        </div>

        <div>
          <label htmlFor="email-body" className={settingsLabelBase}>
            Body (Markdown)
          </label>
          <textarea
            id="email-body"
            rows={14}
            className={settingsInputBase}
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
          />
        </div>

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
            Save template
          </button>
        </div>
      </div>

      <aside className="rounded-card border border-line bg-panel p-4 lg:sticky lg:top-6 lg:self-start">
        <h3 className={settingsLabelBase}>Allowed variables</h3>
        <p className="mb-3 font-body text-xs text-ink-muted">
          Use Mustache-style placeholders in subject and body. Only these tokens
          are accepted by the API.
        </p>
        <ul className="space-y-1.5 font-mono text-xs text-ink-secondary">
          {allowedVars.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
        <p className="mt-4 font-body text-xs text-ink-faint">
          Need another template?{' '}
          <Link
            href="/admin/settings/emails"
            className="text-ink underline transition-opacity duration-fast hover:opacity-70"
          >
            Back to list
          </Link>
        </p>
      </aside>

      <div className="lg:col-span-2">
        <h3 className={settingsLabelBase}>Body preview</h3>
        <div className="rounded-card border border-line bg-panel p-6">
          {bodyMarkdown.trim().length > 0 ? (
            <MarkdownContent markdown={bodyMarkdown} />
          ) : (
            <p className="font-body text-sm italic text-ink-muted">
              Nothing to preview yet.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
