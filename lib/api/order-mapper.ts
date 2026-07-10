import type {
  OrderLine,
  OrderStatus,
  OrderSummary,
  ShippingAddress,
} from '@/types/order';
import type { OrderListResponse } from '@/types/account';

/**
 * Wire → app mappers for the customer order endpoints, mirroring the
 * pattern in [product-mapper.ts](./product-mapper.ts).
 *
 * The backend (`petsupplies-api` `src/services/orderService.ts`) returns raw
 * Prisma rows: UPPERCASE status enum, an `items` array with `priceCents`,
 * flat `ship*` address columns, and no `email` / `currency` / session id on
 * the user-facing order selects. The storefront components consume the
 * `OrderSummary` shape (lowercase status, `lines` with `unitPriceCents`,
 * nested `shippingAddress`). These mappers translate between the two.
 */

/**
 * The store prices every order in a single Stripe currency. The backend
 * `Order` model has no `currency` column (prisma/schema.prisma), so the wire
 * omits it entirely and we default here.
 * followup: backend should add `Order.currency` and return it per-order.
 */
const DEFAULT_ORDER_CURRENCY = 'cad';

/** UPPERCASE Prisma `OrderStatus` enum returned on the wire. */
export type ApiOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'FULFILLED'
  | 'CANCELLED';

/** Raw `OrderItem` row from `orderService` `orderItemSelect`. */
export interface ApiOrderItem {
  id: string;
  quantity: number;
  priceCents: number;
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
  };
}

/**
 * Raw order row from `orderService.listUserOrders`. The list select carries
 * no shipping address and various discount/subscription fields the app
 * ignores (intentionally not modelled here).
 */
export interface ApiOrderListItem {
  id: string;
  status: ApiOrderStatus;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  items: ApiOrderItem[];
}

/** Raw order row from `orderService.getUserOrder` — adds the flat `ship*` columns. */
export interface ApiOrderDetail extends ApiOrderListItem {
  shipName: string | null;
  shipLine1: string | null;
  shipLine2: string | null;
  shipCity: string | null;
  shipRegion: string | null;
  shipPostalCode: string | null;
  shipCountry: string | null;
}

/** Raw paginated envelope from `GET /orders`. */
export interface ApiOrderListResponse {
  data: ApiOrderListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_MAP: Record<ApiOrderStatus, OrderStatus> = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
};

function mapApiOrderLine(item: ApiOrderItem): OrderLine {
  return {
    id: item.id,
    productId: item.product.id,
    slug: item.product.slug,
    name: item.product.name,
    imageUrl: item.product.imageUrl ?? '',
    quantity: item.quantity,
    unitPriceCents: item.priceCents,
    lineTotalCents: item.priceCents * item.quantity,
  };
}

/** The list endpoint omits address columns; the list UI never renders one. */
function emptyShippingAddress(): ShippingAddress {
  return {
    fullName: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };
}

function mapShippingAddress(order: ApiOrderDetail): ShippingAddress {
  return {
    fullName: order.shipName ?? '',
    line1: order.shipLine1 ?? '',
    ...(order.shipLine2 ? { line2: order.shipLine2 } : {}),
    city: order.shipCity ?? '',
    state: order.shipRegion ?? '',
    postalCode: order.shipPostalCode ?? '',
    country: order.shipCountry ?? '',
  };
}

/** Shared fields between the list and detail rows. */
function mapCommon(
  order: ApiOrderListItem,
): Omit<OrderSummary, 'shippingAddress'> {
  return {
    id: order.id,
    status: STATUS_MAP[order.status],
    lines: order.items.map(mapApiOrderLine),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    currency: DEFAULT_ORDER_CURRENCY,
    createdAt: order.createdAt,
    ...(order.trackingNumber ? { trackingNumber: order.trackingNumber } : {}),
    // `email` and `checkoutSessionId` are intentionally omitted: the user order
    // wire carries neither (email lives on the User relation; stripeSessionId
    // isn't selected). Both are optional on OrderSummary.
  };
}

/** Map a single order-list row → `OrderSummary` (no address on the wire). */
export function mapApiOrderListItem(order: ApiOrderListItem): OrderSummary {
  return { ...mapCommon(order), shippingAddress: emptyShippingAddress() };
}

/** Map an order-detail row → `OrderSummary`. */
export function mapApiOrder(order: ApiOrderDetail): OrderSummary {
  return { ...mapCommon(order), shippingAddress: mapShippingAddress(order) };
}

/** Map the `GET /orders` envelope → the account UI list shape. */
export function mapApiOrderListResponse(
  raw: ApiOrderListResponse,
): OrderListResponse {
  return {
    orders: raw.data.map(mapApiOrderListItem),
    total: raw.total,
    page: raw.page,
    pageSize: raw.limit,
    totalPages: raw.totalPages,
  };
}
