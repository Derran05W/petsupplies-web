# Storefront ↔ petsupplies-api contracts

Single reference for query params, enums, and response shapes the web app sends or expects. When the backend changes, update the matching `types/*` file and this doc in the same PR.

Detailed route list: [backend-api-routes.md](./backend-api-routes.md).

## Products

| Concern        | Storefront                                                     | Backend (`GET /products`, `GET /products/:slug`) | Notes                                                                                                 |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Price          | `priceCents`                                                   | `price` (integer cents)                          | Mapped in [lib/api/product-mapper.ts](../lib/api/product-mapper.ts).                                  |
| Stock          | `stockCount`, `inStock`                                        | `stock`, `inStock`                               |                                                                                                       |
| Images         | `alt`                                                          | `altText`                                        |                                                                                                       |
| Rating         | `rating.avg` / `rating.count`                                  | `avgRating` / `reviewCount`                      |                                                                                                       |
| Category / pet | `category`, `petType` (UI enums)                               | `category` (Prisma enum), `tags`                 | Mapper infers shelf category + pet type from API fields.                                              |
| List filters   | `search`, `minPriceCents`, `maxPriceCents`, `page`, `pageSize` | `q`, `minPrice`, `maxPrice`, `page`, `limit`     | `relevance` sort omitted (API default). `petType` / shelf `category` filters are client-side or TODO. |
| List sort      | `price_asc` \| `price_desc` \| `newest`                        | same + `popularity`, `rating_*`                  |                                                                                                       |
| List body      | `products`, `pageSize`, `totalPages`                           | `products`, `limit`, (compute `totalPages`)      |                                                                                                       |
| Detail         | `GET /products/:slug`                                          | Same path                                        | `getProductBySlug` — `React.cache` + `notFound()` on 404.                                             |
| Related row    | filter by `petType` after fetch                                | `GET /products?limit=`                           | API has no `petType` query; filtered in [lib/api/products.ts](../lib/api/products.ts).                |

## Catalog reviews (PDP)

| Concern    | Storefront URL           | API query                                          | Allowed `sort`                                                                                    |
| ---------- | ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Pagination | `reviewsPage`            | `page`                                             | default `1`                                                                                       |
| Page size  | fixed `10` in code       | `limit`                                            | default `20` on API; web sends `10`                                                               |
| List body  | `reviews[]` (normalized) | `data[]`                                           | mapped in [lib/api/reviews.ts](../lib/api/reviews.ts); `verified` → `verifiedPurchase`            |
| Author     | `displayName`, `userId`  | `displayName` from `User.name` or email local-part | PDP marks the signed-in viewer's row as "Your review"; POST requires auth (`userId` = JWT `sub`). |
| Sort       | `reviewsSort`            | `sort`                                             | `newest`, `oldest`, `rating_desc`, `rating_asc`                                                   |

Legacy URL values `recent` and `helpful` map to `newest` in [lib/utils/searchParams.ts](../lib/utils/searchParams.ts). Out-of-range `reviewsPage` is clamped after fetch in [ReviewsSection](../components/product/reviews/ReviewsSection.tsx).

## Checkout (one-time)

| Concern        | Storefront                                 | Backend                                       |
| -------------- | ------------------------------------------ | --------------------------------------------- |
| Create session | `POST /checkout/session`                   | [lib/api/checkout.ts](../lib/api/checkout.ts) |
| Poll order     | saved pending order id → `GET /orders/:id` | primary path                                  |

`getOrderByCheckoutSession` polls `GET /orders/:id` using the order id saved at
session creation. It also tries `GET /orders/by-checkout-session/:sessionId` as
a fallback, but **that route does not exist on the backend** (see gaps below);
it 404s and the poll degrades into the success page's "still processing" panel.

## Orders (account)

Wire rows are Prisma-shaped; [lib/api/order-mapper.ts](../lib/api/order-mapper.ts)
translates them to the `OrderSummary` shape the components consume.

| Storefront field    | Backend (wire) field                             | Notes                                                                |
| ------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `orders`            | `data`                                           | `GET /orders` envelope                                               |
| `pageSize`          | `limit`                                          | request sends `limit` (`GetOrdersOptions.limit`), max 100            |
| `status` (lower)    | `status` (UPPERCASE enum)                        | request uppercases for the validator; response lowercased by mapper  |
| `lines`             | `items`                                          | array rename                                                         |
| `unitPriceCents`    | `items[].priceCents`                             | `lineTotalCents` computed = `priceCents * quantity`                  |
| `shippingAddress`   | flat `shipName` / `shipLine1` / `shipRegion` / … | nested by mapper (detail only; list wire has no address)             |
| `currency`          | — (not in schema)                                | defaulted to `'cad'`; backend `Order` has no currency column         |
| `email`             | — (on `User`, not `Order`)                       | omitted by mapper — `OrderSummary.email` is optional                 |
| `checkoutSessionId` | `stripeSessionId` (not selected on user orders)  | omitted by mapper; success page stitches it in from the redirect URL |

## Account features (subscriptions, wishlist, stock alerts, pets, addresses)

Every list endpoint here returns a `{ data, page, limit, total, totalPages }`
envelope; each API module unwraps `data` (keeping legacy keys for the dev
fallbacks). App-facing types stay stable — the wire → app translation lives at
the API layer, mirroring the product/order mappers.

### Subscriptions — [lib/api/subscriptions.ts](../lib/api/subscriptions.ts)

Base path `GET/PATCH/DELETE /users/me/subscriptions[/:id]`; create is
`POST /subscriptions`.

| Storefront (`Subscription`)                   | Backend (`SubscriptionPublic`)                          | Notes                                                                                    |
| --------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `interval` `2_weeks`…`12_weeks`               | `interval` `WEEK_2`…`WEEK_12`                           | mapped both ways                                                                         |
| `status` `active`/`paused`/`canceled`         | `status` `ACTIVE`/`PAUSED`/`CANCELLED`                  | app union also has `past_due`/`incomplete` (unused by backend)                           |
| `productSlug`/`productName`/`productImageUrl` | nested `product.{slug,name,imageUrl}`                   | flattened; `imageUrl` null → `''`                                                        |
| `unitPriceCents`                              | `product.price` (integer cents)                         |                                                                                          |
| `currentPeriodEnd`                            | `nextDeliveryAt`                                        | renamed                                                                                  |
| `cancelAtPeriodEnd`                           | — (no field)                                            | always `false`; see gaps                                                                 |
| create body                                   | `.strict()` `{ productId, quantity, interval, petId? }` | frontend drops `successUrl`/`cancelUrl`/`clientReferenceId`; Stripe URLs are server-side |
| create response `sessionId`                   | `checkoutSessionId`                                     | redirect uses `url`                                                                      |

### Wishlist / Stock alerts — [lib/api/wishlist.ts](../lib/api/wishlist.ts), [lib/api/stockAlerts.ts](../lib/api/stockAlerts.ts)

`GET/POST /users/me/wishlist` and `/users/me/stock-alerts`. Rows nest a minimal
product snapshot mapped to the app `Product` via `mapCatalogProduct`. The
wishlist snapshot has no `stock` field, so availability is inferred from
`active`; the stock-alert snapshot has real `stock`.

### Pets — [lib/api/pets.ts](../lib/api/pets.ts)

`GET/POST/PATCH/DELETE /users/me/pets[/:id]`. `species` is the backend
`PetSpecies` enum lowercased (`dog`,`cat`,`fish`,`bird`,`rabbit`,`hamster`,`guinea_pig`,`reptile`,`other`);
mapped to/from UPPERCASE by pure case change. Absent optionals arrive as `null`
→ dropped; `birthDate` is sent/stored as `YYYY-MM-DD` (backend normalises to UTC
midnight; the mapper slices the ISO timestamp back to date-only).

### Addresses — [lib/api/addresses.ts](../lib/api/addresses.ts)

Base path `/users/me/addresses` (**not** `/addresses`).

| Storefront (`Address`) | Backend (`Address`) | Notes                                                            |
| ---------------------- | ------------------- | ---------------------------------------------------------------- |
| `fullName`             | `label` (optional)  | backend has no recipient-name column; round-trips via `label`    |
| `state`                | `region`            | renamed                                                          |
| `country`              | `country` `'CA'`    | form is constrained to Canada (only value the validator accepts) |

## Email preferences

`lib/api/email.ts` and `getSharedOrder` target routes that **do not exist yet**
(see gaps). Callers surface a clean `ApiError` and render friendly error /
`notFound()` states rather than crashing.

## Backend gaps (frontend degrades gracefully until these ship)

| Route the frontend calls                       | Expected shape                                       | Current behavior                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `GET /orders/by-checkout-session/:sessionId`   | `OrderSummary` wire row (query by `stripeSessionId`) | 404 → poll retries → success page "still processing"                                                                      |
| `GET /orders/:id/shared?token=…`               | `OrderSummary` wire row + `email`, token-authed      | 404/401 → email order page `notFound()`                                                                                   |
| `POST /email/unsubscribe`                      | 204                                                  | 404 → friendly error panel                                                                                                |
| `GET /email/preferences?token=…`               | `{ preferences: EmailMarketingPreferences }`         | 404 → friendly error panel                                                                                                |
| `PATCH /email/preferences?token=…`             | 204                                                  | 404 → friendly error panel                                                                                                |
| Subscription response `cancelAtPeriodEnd` flag | boolean on `SubscriptionPublic`                      | backend omits it → mapped to `false`; "cancel renewal" reflects only after the Stripe webhook flips status to `CANCELLED` |

## Admin

Every admin list/analytics endpoint uses `limit` (not `pageSize`), UPPERCASE status enums, and returns `{ data, page, limit, total, totalPages }` envelopes. The web app sends `limit`/UPPERCASE and maps envelopes back to its `{ …, pageSize }` app shapes at the API layer. Full route detail: [backend-api-routes.md](./backend-api-routes.md#admin).

| Concern            | Storefront                                                        | Backend                                                                                      | Mapper                                                                                                       |
| ------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Orders list        | `pageSize`, `{ orders }`, lowercase                               | `limit`, `{ data }`, UPPERCASE status                                                        | [lib/api/admin/orders.ts](../lib/api/admin/orders.ts)                                                        |
| Fulfillment queue  | `pageSize`, `{ orders }`                                          | `limit`, `{ data }`; status defaults `PAID`                                                  | [lib/api/admin/fulfillment.ts](../lib/api/admin/fulfillment.ts)                                              |
| Bulk ship          | `{ orderIds, trackingNumber?, carrier? }` → `{ updated, failed }` | `{ items:[{orderId,trackingNumber,carrier}] }` → `{ results:[{orderId,ok,status?,error?}] }` | same file                                                                                                    |
| Customers list     | `pageSize`, `search`, `{ customers }`                             | `limit`, `email`, `{ data }`                                                                 | [lib/api/admin/customers.ts](../lib/api/admin/customers.ts)                                                  |
| Customer detail    | flat `ordersCount`, `subscriptionsCount`                          | nested `counts: { orders, subscriptions }`                                                   | same file                                                                                                    |
| Analytics overview | `ordersCount`, `currency`                                         | `orderCount`; no `customersCount`/`currency`                                                 | [analytics-normalize.ts](../lib/api/admin/analytics-normalize.ts) (`currency` → `cad`, `customersCount` → 0) |
| Revenue timeseries | `range` (`7d`/`30d`/`90d`), `{ points:[{date}] }`                 | `from`/`to` dates, `{ points:[{bucket}] }`                                                   | [lib/api/admin/analytics.ts](../lib/api/admin/analytics.ts) (`bucket` → `date`)                              |
| Dashboard stats    | `getDashboardStats()`                                             | **no `/admin/dashboard`** — composed from `overview` + `low-stock`                           | [lib/api/admin/dashboard.ts](../lib/api/admin/dashboard.ts)                                                  |

No `currency` is on any admin wire response; the store settles in one currency and the app defaults to `cad`. recharts is code-split out of the main admin bundle via `next/dynamic(ssr:false)` in [RevenueChartClient.tsx](../components/admin/analytics/RevenueChartClient.tsx) → [RevenueChartCanvas.tsx](../components/admin/analytics/RevenueChartCanvas.tsx).

## Reviews (user edits)

`PATCH` / `DELETE` `/reviews/:id` — auth required; types in [types/review.ts](../types/review.ts).

## Dev fallbacks (remove when API is stable on staging)

| Module                | Trigger                 | Behavior                                 |
| --------------------- | ----------------------- | ---------------------------------------- |
| `lib/api/products.ts` | Network error           | `FEATURED_PRODUCTS` filter               |
| `lib/api/checkout.ts` | Network error           | Placeholder Stripe session               |
| `lib/api/reviews.ts`  | `E2E_REVIEWS_FIXTURE=1` | Deterministic review list for Playwright |
