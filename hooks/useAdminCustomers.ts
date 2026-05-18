'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  adminGetCustomer,
  adminGetCustomerOrders,
  adminGetCustomerSubscriptions,
  adminListCustomers,
} from '@/lib/api/admin/customers';

const ADMIN_CUSTOMERS_ROOT = ['admin', 'customers'] as const;

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface AdminCustomersListKey {
  page: number;
  search: string;
}

function listKey(args: AdminCustomersListKey) {
  return [...ADMIN_CUSTOMERS_ROOT, 'list', args] as const;
}

export function useAdminCustomersListQuery(args: AdminCustomersListKey) {
  return useQuery({
    queryKey: listKey(args),
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminListCustomers({
        page: args.page,
        search: args.search || undefined,
        ...(accessToken ? { accessToken } : {}),
      });
    },
    staleTime: 30_000,
  });
}

export function useAdminCustomerDetailQuery(id: string | null) {
  return useQuery({
    queryKey: [...ADMIN_CUSTOMERS_ROOT, 'detail', id ?? '__none__'],
    enabled: id !== null && id.length > 0,
    queryFn: async () => {
      if (!id) throw new Error('missing id');
      const accessToken = await getBrowserAccessToken();
      return adminGetCustomer(id, accessToken ? { accessToken } : {});
    },
    staleTime: 30_000,
  });
}

export interface AdminCustomerOrdersKey {
  customerId: string;
  page: number;
}

export function useAdminCustomerOrdersQuery(args: AdminCustomerOrdersKey) {
  return useQuery({
    queryKey: [...ADMIN_CUSTOMERS_ROOT, 'orders', args.customerId, args.page],
    enabled: args.customerId.length > 0,
    queryFn: async () => {
      const accessToken = await getBrowserAccessToken();
      return adminGetCustomerOrders(args.customerId, {
        page: args.page,
        ...(accessToken ? { accessToken } : {}),
      });
    },
    staleTime: 30_000,
  });
}

export function useAdminCustomerSubscriptionsQuery(customerId: string | null) {
  return useQuery({
    queryKey: [
      ...ADMIN_CUSTOMERS_ROOT,
      'subscriptions',
      customerId ?? '__none__',
    ],
    enabled: customerId !== null && customerId.length > 0,
    queryFn: async () => {
      if (!customerId) throw new Error('missing id');
      const accessToken = await getBrowserAccessToken();
      return adminGetCustomerSubscriptions(
        customerId,
        accessToken ? { accessToken } : {},
      );
    },
    staleTime: 30_000,
  });
}
