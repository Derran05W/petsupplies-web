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
  patchSiteSettings,
  type SiteSettingsPatch,
} from '@/lib/api/admin/site-settings';
import { fetchSiteSettingsForAdmin } from '@/lib/api/site/settings';
import type { SiteSettingsPublic } from '@/types/site';

const SITE_SETTINGS_ROOT = ['admin', 'site-settings'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useSiteSettingsQuery(): UseQueryResult<
  SiteSettingsPublic,
  Error
> {
  return useQuery({
    queryKey: SITE_SETTINGS_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return fetchSiteSettingsForAdmin(accessToken);
    },
    staleTime: 30_000,
  });
}

export function useUpdateSiteSettingsMutation(): UseMutationResult<
  SiteSettingsPublic,
  Error,
  SiteSettingsPatch
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch) => {
      const accessToken = await getBrowserAccessToken();
      return patchSiteSettings(patch, accessToken ? { accessToken } : {});
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(SITE_SETTINGS_ROOT, updated);
    },
  });
}
