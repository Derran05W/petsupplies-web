import type {
  CreateSubscriptionCheckoutRequest,
  CreateSubscriptionCheckoutResponse,
  Subscription,
  UpdateSubscriptionRequest,
} from '@/types/subscription';
import { ApiError, apiFetch } from './client';

export interface SubscriptionsApiOptions {
  accessToken?: string;
}

let warnedSubscriptionsFallback = false;

function warnListFallback(): void {
  if (warnedSubscriptionsFallback) return;
  warnedSubscriptionsFallback = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[subscriptions] backend unreachable — empty list for dev / offline',
  );
}

function isNetwork(err: unknown): err is ApiError {
  return err instanceof ApiError && err.isNetworkError;
}

/** Canonical path per docs/backend-api-routes.md */
const BASE = '/users/me/subscriptions';

function normalizeSubscriptionsPayload(raw: unknown): Subscription[] {
  if (Array.isArray(raw)) {
    return raw as Subscription[];
  }
  if (raw && typeof raw === 'object') {
    if (
      'subscriptions' in raw &&
      Array.isArray((raw as { subscriptions: Subscription[] }).subscriptions)
    ) {
      return (raw as { subscriptions: Subscription[] }).subscriptions;
    }
    if (
      'items' in raw &&
      Array.isArray((raw as { items: Subscription[] }).items)
    ) {
      return (raw as { items: Subscription[] }).items;
    }
  }
  return [];
}

export async function listSubscriptions(
  options: SubscriptionsApiOptions = {},
): Promise<Subscription[]> {
  try {
    const raw = await apiFetch<unknown>(
      BASE,
      options.accessToken
        ? { cache: 'no-store', accessToken: options.accessToken }
        : { cache: 'no-store' },
    );
    return normalizeSubscriptionsPayload(raw);
  } catch (err) {
    if (isNetwork(err)) {
      warnListFallback();
      return [];
    }
    throw err;
  }
}

export async function getSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription | null> {
  try {
    return await apiFetch<Subscription>(
      `${BASE}/${encodeURIComponent(id)}`,
      options.accessToken
        ? { cache: 'no-store', accessToken: options.accessToken }
        : { cache: 'no-store' },
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createSubscriptionCheckout(
  body: CreateSubscriptionCheckoutRequest,
  options: SubscriptionsApiOptions = {},
): Promise<CreateSubscriptionCheckoutResponse> {
  return await apiFetch<CreateSubscriptionCheckoutResponse>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(body),
    ...(options.accessToken ? { accessToken: options.accessToken } : {}),
  });
}

export async function updateSubscription(
  id: string,
  patch: UpdateSubscriptionRequest,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  return await apiFetch<Subscription>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    ...(options.accessToken ? { accessToken: options.accessToken } : {}),
  });
}

export async function pauseSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  return await apiFetch<Subscription>(
    `${BASE}/${encodeURIComponent(id)}/pause`,
    {
      method: 'POST',
      ...(options.accessToken ? { accessToken: options.accessToken } : {}),
    },
  );
}

export async function resumeSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  return await apiFetch<Subscription>(
    `${BASE}/${encodeURIComponent(id)}/resume`,
    {
      method: 'POST',
      ...(options.accessToken ? { accessToken: options.accessToken } : {}),
    },
  );
}

/** Returns parsed body when present; undefined on 204. */
export async function cancelSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription | undefined> {
  return await apiFetch<Subscription | undefined>(
    `${BASE}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      ...(options.accessToken ? { accessToken: options.accessToken } : {}),
    },
  );
}

export function isSubscriptionDiscountConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
