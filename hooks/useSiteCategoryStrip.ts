'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { replaceCategoryStrip } from '@/lib/api/admin/site-nav';
import { fetchCategoryStripForAdmin } from '@/lib/api/site/category-strip';
import type { CategoryStripItem, CategoryStripItemInput } from '@/types/site';

const CATEGORY_STRIP_ROOT = ['admin', 'site-category-strip'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function useCategoryStripQuery(): UseQueryResult<
  CategoryStripItem[],
  Error
> {
  return useQuery({
    queryKey: CATEGORY_STRIP_ROOT,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return fetchCategoryStripForAdmin(accessToken);
    },
    staleTime: 30_000,
  });
}

export function useReplaceCategoryStripMutation(): UseMutationResult<
  CategoryStripItem[],
  Error,
  CategoryStripItemInput[]
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items) => {
      const accessToken = await getBrowserAccessToken();
      return replaceCategoryStrip(items, accessToken ? { accessToken } : {});
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(CATEGORY_STRIP_ROOT, updated);
    },
  });
}
