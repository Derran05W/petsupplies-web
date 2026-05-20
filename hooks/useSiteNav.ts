'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { replaceFooterNav, replaceHeaderNav } from '@/lib/api/admin/site-nav';
import { fetchSiteNavForAdmin } from '@/lib/api/site/nav';
import type { FooterColumn, NavLink } from '@/types/site';
import type { SiteNavPublic } from '@/lib/site/nav-fallbacks';

const SITE_NAV_ROOT = ['admin', 'site-nav'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useSiteNavQuery(): UseQueryResult<SiteNavPublic, Error> {
  return useQuery({
    queryKey: SITE_NAV_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return fetchSiteNavForAdmin(accessToken);
    },
    staleTime: 30_000,
  });
}

export function useReplaceHeaderNavMutation(): UseMutationResult<
  SiteNavPublic,
  Error,
  NavLink[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (links) => {
      const accessToken = await getBrowserAccessToken();
      return replaceHeaderNav(links, accessToken ? { accessToken } : {});
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(SITE_NAV_ROOT, updated);
    },
  });
}

export function useReplaceFooterNavMutation(): UseMutationResult<
  SiteNavPublic,
  Error,
  FooterColumn[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (columns) => {
      const accessToken = await getBrowserAccessToken();
      return replaceFooterNav(columns, accessToken ? { accessToken } : {});
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(SITE_NAV_ROOT, updated);
    },
  });
}
