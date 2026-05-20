'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  adminGetEmailTemplate,
  adminListEmailTemplates,
  adminUpsertEmailTemplate,
} from '@/lib/api/admin/site-email-templates';
import type {
  EmailTemplateAdminDetail,
  EmailTemplateAdminSummary,
  EmailTemplateKey,
  EmailTemplateUpsertInput,
} from '@/types/site';

const ADMIN_EMAIL_TEMPLATES_ROOT = ['admin', 'email-templates'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useAdminEmailTemplatesQuery(): UseQueryResult<
  { templates: EmailTemplateAdminSummary[] },
  Error
> {
  return useQuery({
    queryKey: ADMIN_EMAIL_TEMPLATES_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminListEmailTemplates(accessToken ? { accessToken } : {});
    },
    staleTime: 30_000,
  });
}

export function useAdminEmailTemplateQuery(
  key: EmailTemplateKey | null,
): UseQueryResult<EmailTemplateAdminDetail, Error> {
  return useQuery({
    queryKey: [...ADMIN_EMAIL_TEMPLATES_ROOT, 'detail', key ?? '__none__'],
    enabled: key !== null,
    queryFn: async () => {
      if (!key) throw new Error('No template key');
      const accessToken = await getBrowserAccessToken();
      return adminGetEmailTemplate(key, accessToken ? { accessToken } : {});
    },
    staleTime: 30_000,
  });
}

export function useUpsertEmailTemplateMutation(): UseMutationResult<
  EmailTemplateAdminDetail,
  Error,
  { key: EmailTemplateKey; body: EmailTemplateUpsertInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, body }) => {
      const accessToken = await getBrowserAccessToken();
      return adminUpsertEmailTemplate(
        key,
        body,
        accessToken ? { accessToken } : {},
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_EMAIL_TEMPLATES_ROOT });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_EMAIL_TEMPLATES_ROOT, 'detail', variables.key],
      });
    },
  });
}
