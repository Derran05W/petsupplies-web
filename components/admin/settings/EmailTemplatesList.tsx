'use client';

import Link from 'next/link';
import { useAdminEmailTemplatesQuery } from '@/hooks/useAdminEmailTemplates';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  emailTemplateLabel,
  type EmailTemplateKey,
} from '@/lib/site/email-template-vars';
import { formatDate } from '@/lib/utils/format';

export function EmailTemplatesList() {
  const { data, isPending, error } = useAdminEmailTemplatesQuery();

  if (isPending) {
    return (
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading email templates…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(error)}
      </p>
    );
  }

  const templates = data?.templates ?? [];

  return (
    <div className="max-w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Transactional email templates</caption>
          <thead className="border-b border-line">
            <tr className="font-body text-micro uppercase text-ink-muted">
              <th scope="col" className="px-4 py-3">
                Template
              </th>
              <th scope="col" className="px-4 py-3">
                Subject
              </th>
              <th scope="col" className="hidden px-4 py-3 md:table-cell">
                Updated
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr
                key={template.key}
                className="border-b border-line font-body text-sm text-ink-secondary transition-colors duration-fast last:border-0 hover:bg-panel"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-ink">
                    {emailTemplateLabel(template.key as EmailTemplateKey)}
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-ink-faint">
                    {template.key}
                  </span>
                </td>
                <td className="px-4 py-3">{template.subject}</td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {formatDate(template.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/settings/emails/${template.key}`}
                    className="border-b border-ink pb-0.5 font-body text-micro uppercase text-ink transition-opacity duration-fast hover:opacity-60"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
