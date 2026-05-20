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
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading email templates…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-body text-sm text-red-700" role="alert">
        {adminApiErrorMessage(error)}
      </p>
    );
  }

  const templates = data?.templates ?? [];

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Transactional email templates</caption>
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
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
                className="text-warm-800 border-b border-warm-100 font-body text-sm last:border-0"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-warm-900">
                    {emailTemplateLabel(template.key as EmailTemplateKey)}
                  </span>
                  <span className="text-warm-500 mt-0.5 block font-mono text-xs">
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
                    className="font-body text-sm text-brand-600 hover:text-brand-700"
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
