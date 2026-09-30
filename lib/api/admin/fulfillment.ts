import type {
  AdminBulkShipFailure,
  AdminBulkShipRequest,
  AdminBulkShipResponse,
  AdminBulkShipResult,
  AdminFulfillmentQueueResponse,
} from '@/types/admin-fulfillment';
import type { AdminOrderSummary } from '@/types/admin';
import type { OrderStatus, ShippingAddress } from '@/types/order';
import { apiFetch } from '../client';

export interface AdminApiOptions {
  accessToken?: string;
}

export interface AdminFulfillmentQueueParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  accessToken?: string;
}

/* -------------------------------------------------------------------------- */
/* Wire types + mappers (petsupplies-api → app shape)                         */
/* -------------------------------------------------------------------------- */

/**
 * The store prices every order in one Stripe currency; the backend `Order`
 * model has no `currency` column, so the wire omits it and we default here.
 * followup: backend should add `Order.currency` and return it per-order.
 */
const DEFAULT_ORDER_CURRENCY = 'cad';

/** Row from `fulfillmentService.listFulfillmentQueue` `orderQueueSelect`. */
interface ApiFulfillmentQueueRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED';
  totalCents: number;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
  createdAt: string;
  shipName: string | null;
  shipLine1: string | null;
  shipCity: string | null;
  shipRegion: string | null;
  shipPostalCode: string | null;
  shipCountry: string | null;
  user: { id: string; email: string; name: string | null } | null;
}

interface ApiFulfillmentQueueResponse {
  data: ApiFulfillmentQueueRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiBulkShipResultRow {
  orderId: string;
  ok: boolean;
  status?: string;
  error?: string;
}

interface ApiBulkShipResponse {
  results: ApiBulkShipResultRow[];
}

function mapShippingAddress(row: ApiFulfillmentQueueRow): ShippingAddress {
  return {
    fullName: row.shipName ?? '',
    line1: row.shipLine1 ?? '',
    city: row.shipCity ?? '',
    state: row.shipRegion ?? '',
    postalCode: row.shipPostalCode ?? '',
    country: row.shipCountry ?? '',
  };
}

/**
 * The queue select carries no line items or money breakdown (subtotal /
 * shipping / tax) — the queue UI only renders id, customer, status and total.
 * Missing fields get safe defaults so the row still satisfies
 * `AdminOrderSummary`.
 */
function mapQueueRow(row: ApiFulfillmentQueueRow): AdminOrderSummary {
  return {
    id: row.id,
    checkoutSessionId: '',
    status: row.status.toLowerCase() as OrderStatus,
    email: row.user?.email ?? '',
    shippingAddress: mapShippingAddress(row),
    lines: [],
    subtotalCents: 0,
    shippingCents: 0,
    taxCents: 0,
    totalCents: row.totalCents,
    currency: DEFAULT_ORDER_CURRENCY,
    createdAt: row.createdAt,
    ...(row.trackingNumber ? { trackingNumber: row.trackingNumber } : {}),
    customerEmail: row.user?.email ?? '',
    customerId: row.user?.id ?? '',
    ...(row.user?.name ? { customerName: row.user.name } : {}),
  };
}

function mapQueueResponse(
  raw: ApiFulfillmentQueueResponse,
): AdminFulfillmentQueueResponse {
  return {
    orders: raw.data.map(mapQueueRow),
    total: raw.total,
    page: raw.page,
    pageSize: raw.limit,
    totalPages: raw.totalPages,
  };
}

function mapBulkShipResponse(raw: ApiBulkShipResponse): AdminBulkShipResponse {
  const updated: AdminBulkShipResult[] = [];
  const failed: AdminBulkShipFailure[] = [];
  for (const row of raw.results) {
    if (row.ok) {
      updated.push({
        id: row.orderId,
        status: (row.status
          ? row.status.toLowerCase()
          : 'shipped') as OrderStatus,
      });
    } else {
      failed.push({
        orderId: row.orderId,
        message: row.error ?? 'Update failed',
      });
    }
  }
  return { updated, failed };
}

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

export async function adminFulfillmentQueue(
  params: AdminFulfillmentQueueParams = {},
): Promise<AdminFulfillmentQueueResponse> {
  const { page = 1, pageSize = 20, status, accessToken } = params;
  const q = new URLSearchParams();
  q.set('page', String(page));
  // Backend `fulfillmentQueueQuerySchema` uses `limit` and an UPPERCASE enum.
  q.set('limit', String(pageSize));
  if (status) q.set('status', status.toUpperCase());
  const raw = await apiFetch<ApiFulfillmentQueueResponse>(
    `/admin/fulfillment/queue?${q}`,
    { cache: 'no-store', ...(accessToken ? { accessToken } : {}) },
  );
  return mapQueueResponse(raw);
}

export async function adminBulkShip(
  body: AdminBulkShipRequest,
  options: AdminApiOptions = {},
): Promise<AdminBulkShipResponse> {
  const { accessToken } = options;
  // Backend `bulkShipSchema` REQUIRES a non-empty `trackingNumber` and
  // `carrier` per item (min 1). The dialog enforces this; guard here so we
  // never send empties that the backend would 400. `trackingUrl` has no
  // backend field and is dropped.
  const trackingNumber = body.trackingNumber?.trim();
  const carrier = body.carrier?.trim();
  if (!trackingNumber || !carrier) {
    throw new Error('Bulk ship requires a tracking number and carrier.');
  }
  const payload = {
    items: body.orderIds.map((orderId) => ({
      orderId,
      trackingNumber,
      carrier,
    })),
  };
  const raw = await apiFetch<ApiBulkShipResponse>(
    '/admin/fulfillment/bulk-ship',
    {
      method: 'POST',
      body: JSON.stringify(payload),
      cache: 'no-store',
      ...(accessToken ? { accessToken } : {}),
    },
  );
  return mapBulkShipResponse(raw);
}
