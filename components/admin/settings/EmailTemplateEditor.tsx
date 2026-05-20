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
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading template…
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
          <p className="font-body text-sm font-medium text-warm-900">
            {emailTemplateLabel(templateKey)}
          </p>
          <p className="text-warm-500 mt-1 font-mono text-xs">{templateKey}</p>
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
          <p className="text-warm-500 mt-1.5 font-body text-xs">
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
            Save template
          </button>
        </div>
      </div>

      <aside className="rounded-xl border border-warm-200 bg-warm-50 p-4 lg:sticky lg:top-6 lg:self-start">
        <h3 className={settingsLabelBase}>Allowed variables</h3>
        <p className="mb-3 font-body text-xs text-warm-600">
          Use Mustache-style placeholders in subject and body. Only these tokens
          are accepted by the API.
        </p>
        <ul className="text-warm-800 space-y-1.5 font-mono text-xs">
          {allowedVars.map((token) => (
            <li key={token}>{token}</li>
          ))}
        </ul>
        <p className="text-warm-500 mt-4 font-body text-xs">
          Need another template?{' '}
          <Link
            href="/admin/settings/emails"
            className="text-brand-600 underline"
          >
            Back to list
          </Link>
        </p>
      </aside>

      <div className="lg:col-span-2">
        <h3 className={settingsLabelBase}>Body preview</h3>
        <div className="rounded-xl border border-warm-200 bg-surface-card p-6">
          {bodyMarkdown.trim().length > 0 ? (
            <MarkdownContent markdown={bodyMarkdown} />
          ) : (
            <p className="text-warm-500 font-body text-sm italic">
              Nothing to preview yet.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
