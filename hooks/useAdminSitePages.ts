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
  adminListSitePages,
  adminUpsertSitePage,
  type StaticPageUpsertInput,
} from '@/lib/api/admin/site-pages';
import type { StaticPageAdmin, StaticPageSlug } from '@/types/site';

const ADMIN_SITE_PAGES_ROOT = ['admin', 'site-pages'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useAdminSitePagesQuery(): UseQueryResult<
  { pages: StaticPageAdmin[] },
  Error
> {
  return useQuery({
    queryKey: ADMIN_SITE_PAGES_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminListSitePages(accessToken ? { accessToken } : {});
    },
    staleTime: 30_000,
  });
}

export function useUpsertSitePageMutation(): UseMutationResult<
  StaticPageAdmin,
  Error,
  { slug: StaticPageSlug; body: StaticPageUpsertInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, body }) => {
      const accessToken = await getBrowserAccessToken();
      return adminUpsertSitePage(
        slug,
        body,
        accessToken ? { accessToken } : {},
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SITE_PAGES_ROOT });
    },
  });
}
