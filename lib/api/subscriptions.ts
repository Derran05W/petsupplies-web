import type {
  CreateSubscriptionCheckoutRequest,
  CreateSubscriptionCheckoutResponse,
  Subscription,
  SubscriptionInterval,
  SubscriptionStatus,
  UpdateSubscriptionRequest,
} from '@/types/subscription';
import { ApiError, apiFetch } from './client';

export interface SubscriptionsApiOptions {
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers (backend is Prisma-shaped: nested product, uppercase  */
/* enums, `nextDeliveryAt`, `{ data: [...] }` list envelope).                 */
/* -------------------------------------------------------------------------- */

type ApiSubscriptionInterval = 'WEEK_2' | 'WEEK_4' | 'WEEK_8' | 'WEEK_12';
type ApiSubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

interface ApiSubscription {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    /** Integer cents (same units as catalog `price`). */
    price: number;
  };
  petId: string | null;
  pet: { id: string; name: string; species: string } | null;
  quantity: number;
  interval: ApiSubscriptionInterval;
  status: ApiSubscriptionStatus;
  discountPercent: number;
  nextDeliveryAt: string;
  pausedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const INTERVAL_WIRE_TO_APP: Record<
  ApiSubscriptionInterval,
  SubscriptionInterval
> = {
  WEEK_2: '2_weeks',
  WEEK_4: '4_weeks',
  WEEK_8: '8_weeks',
  WEEK_12: '12_weeks',
};

const INTERVAL_APP_TO_WIRE: Record<
  SubscriptionInterval,
  ApiSubscriptionInterval
> = {
  '2_weeks': 'WEEK_2',
  '4_weeks': 'WEEK_4',
  '8_weeks': 'WEEK_8',
  '12_weeks': 'WEEK_12',
};

const STATUS_WIRE_TO_APP: Record<ApiSubscriptionStatus, SubscriptionStatus> = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'canceled',
};

function isApiSubscription(raw: unknown): raw is ApiSubscription {
  return (
    !!raw &&
    typeof raw === 'object' &&
    'product' in raw &&
    typeof (raw as { product: unknown }).product === 'object' &&
    (raw as { product: unknown }).product !== null
  );
}

/**
 * Map a Prisma-shaped `SubscriptionPublic` to the flat app `Subscription`.
 * Already-app-shaped rows (dev fallbacks / fixtures) pass through untouched.
 *
 * The backend response has no `cancelAtPeriodEnd` flag — a cancel schedules
 * Stripe's period-end cancellation and the DB status only flips to
 * `CANCELLED` once the webhook lands, so we surface `false` here. (Gap noted
 * in docs/api-contracts.md.)
 */
function mapSubscription(raw: unknown): Subscription {
  if (!isApiSubscription(raw)) {
    return raw as Subscription;
  }
  return {
    id: raw.id,
    productId: raw.productId,
    productSlug: raw.product.slug,
    productName: raw.product.name,
    productImageUrl: raw.product.imageUrl ?? '',
    quantity: raw.quantity,
    interval: INTERVAL_WIRE_TO_APP[raw.interval],
    unitPriceCents: raw.product.price,
    status: STATUS_WIRE_TO_APP[raw.status],
    cancelAtPeriodEnd: false,
    currentPeriodEnd: raw.nextDeliveryAt,
    petId: raw.petId,
    createdAt: raw.createdAt,
  };
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
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === 'object') {
    // Backend paginated envelope is `{ data: [...] }`. The `subscriptions` /
    // `items` keys are retained for the dev fallbacks.
    for (const key of ['data', 'subscriptions', 'items'] as const) {
      const value = (raw as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        rows = value;
        break;
      }
    }
  }
  return rows.map(mapSubscription);
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
    const raw = await apiFetch<unknown>(
      `${BASE}/${encodeURIComponent(id)}`,
      options.accessToken
        ? { cache: 'no-store', accessToken: options.accessToken }
        : { cache: 'no-store' },
    );
    return mapSubscription(raw);
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
  // The validator is `.strict()`: send only the four accepted fields, with the
  // interval in the backend's uppercase enum form.
  const wireBody = {
    productId: body.productId,
    quantity: body.quantity,
    interval: INTERVAL_APP_TO_WIRE[body.interval],
    ...(body.petId ? { petId: body.petId } : {}),
  };
  const raw = await apiFetch<{
    url: string;
    checkoutSessionId?: string;
    sessionId?: string;
  }>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(wireBody),
    ...(options.accessToken ? { accessToken: options.accessToken } : {}),
  });
  return {
    url: raw.url,
    sessionId: raw.checkoutSessionId ?? raw.sessionId ?? '',
  };
}

export async function updateSubscription(
  id: string,
  patch: UpdateSubscriptionRequest,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  const wirePatch: Record<string, unknown> = {};
  if (patch.quantity !== undefined) wirePatch.quantity = patch.quantity;
  if (patch.interval !== undefined) {
    wirePatch.interval = INTERVAL_APP_TO_WIRE[patch.interval];
  }
  if (patch.petId !== undefined) wirePatch.petId = patch.petId;
  const raw = await apiFetch<unknown>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(wirePatch),
    ...(options.accessToken ? { accessToken: options.accessToken } : {}),
  });
  return mapSubscription(raw);
}

export async function pauseSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  const raw = await apiFetch<unknown>(
    `${BASE}/${encodeURIComponent(id)}/pause`,
    {
      method: 'POST',
      ...(options.accessToken ? { accessToken: options.accessToken } : {}),
    },
  );
  return mapSubscription(raw);
}

export async function resumeSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription> {
  const raw = await apiFetch<unknown>(
    `${BASE}/${encodeURIComponent(id)}/resume`,
    {
      method: 'POST',
      ...(options.accessToken ? { accessToken: options.accessToken } : {}),
    },
  );
  return mapSubscription(raw);
}

/** Returns parsed body when present; undefined on 204. */
export async function cancelSubscription(
  id: string,
  options: SubscriptionsApiOptions = {},
): Promise<Subscription | undefined> {
  const raw = await apiFetch<unknown>(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    ...(options.accessToken ? { accessToken: options.accessToken } : {}),
  });
  return raw === undefined || raw === null ? undefined : mapSubscription(raw);
}

export function isSubscriptionDiscountConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
