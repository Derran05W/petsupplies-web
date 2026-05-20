import { apiFetch } from '@/lib/api/client';
import type {
  EmailTemplateAdminDetail,
  EmailTemplateAdminSummary,
  EmailTemplateKey,
  EmailTemplateUpsertInput,
} from '@/types/site';

export interface AdminEmailTemplateOptions {
  accessToken?: string;
}

function fetchOpts(accessToken?: string) {
  return accessToken
    ? { cache: 'no-store' as const, accessToken }
    : { cache: 'no-store' as const };
}

export async function adminListEmailTemplates(
  options: AdminEmailTemplateOptions = {},
): Promise<{ templates: EmailTemplateAdminSummary[] }> {
  const { accessToken } = options;
  return apiFetch<{ templates: EmailTemplateAdminSummary[] }>(
    '/admin/site/email-templates',
    fetchOpts(accessToken),
  );
}

export async function adminGetEmailTemplate(
  key: EmailTemplateKey,
  options: AdminEmailTemplateOptions = {},
): Promise<EmailTemplateAdminDetail> {
  const { accessToken } = options;
  return apiFetch<EmailTemplateAdminDetail>(
    `/admin/site/email-templates/${key}`,
    fetchOpts(accessToken),
  );
}

export async function adminUpsertEmailTemplate(
  key: EmailTemplateKey,
  body: EmailTemplateUpsertInput,
  options: AdminEmailTemplateOptions = {},
): Promise<EmailTemplateAdminDetail> {
  const { accessToken } = options;
  return apiFetch<EmailTemplateAdminDetail>(
    `/admin/site/email-templates/${key}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
      ...fetchOpts(accessToken),
    },
  );
}
