# petsupplies-api — route inventory (notes)

Reference snapshot for aligning the storefront (`petsupplies-web`) with the backend. Update this file when the API surface changes.

---

## Public (no user JWT)

| Method | Path                      | Notes                                             |
| ------ | ------------------------- | ------------------------------------------------- |
| GET    | `/health`                 | Liveness                                          |
| GET    | `/products`               | List + filters (query params per listQuerySchema) |
| GET    | `/products/:slug`         | Product detail                                    |
| GET    | `/products/:slug/reviews` | Paginated reviews                                 |

---

## Authenticated (logged-in user)

| Method | Path                                 |
| ------ | ------------------------------------ |
| POST   | `/products/:slug/reviews`            |
| GET    | `/users/me`                          |
| PATCH  | `/users/me`                          |
| GET    | `/users/me/addresses`                |
| POST   | `/users/me/addresses`                |
| PATCH  | `/users/me/addresses/:id`            |
| DELETE | `/users/me/addresses/:id`            |
| POST   | `/users/me/addresses/:id/default`    |
| GET    | `/cart`                              |
| POST   | `/cart/items`                        |
| PATCH  | `/cart/items/:id`                    |
| DELETE | `/cart/items/:id`                    |
| POST   | `/cart/discount`                     |
| DELETE | `/cart/discount`                     |
| DELETE | `/cart`                              |
| POST   | `/checkout/session`                  |
| POST   | `/subscriptions`                     |
| GET    | `/orders`                            |
| GET    | `/orders/:id`                        |
| PATCH  | `/reviews/:id`                       |
| DELETE | `/reviews/:id`                       |
| GET    | `/users/me/wishlist`                 |
| POST   | `/users/me/wishlist`                 |
| DELETE | `/users/me/wishlist/:productId`      |
| GET    | `/users/me/stock-alerts`             |
| POST   | `/users/me/stock-alerts`             |
| DELETE | `/users/me/stock-alerts/:productId`  |
| GET    | `/users/me/pets`                     |
| GET    | `/users/me/pets/:id`                 |
| POST   | `/users/me/pets`                     |
| PATCH  | `/users/me/pets/:id`                 |
| DELETE | `/users/me/pets/:id`                 |
| GET    | `/users/me/subscriptions`            |
| GET    | `/users/me/subscriptions/:id`        |
| PATCH  | `/users/me/subscriptions/:id`        |
| POST   | `/users/me/subscriptions/:id/pause`  |
| POST   | `/users/me/subscriptions/:id/resume` |
| DELETE | `/users/me/subscriptions/:id`        |

---

## Stock alerts (back in stock)

All routes require a **logged-in user JWT**.

| Method | Path                                | Purpose                    |
| ------ | ----------------------------------- | -------------------------- |
| GET    | `/users/me/stock-alerts`            | List active alerts         |
| POST   | `/users/me/stock-alerts`            | Create alert for a product |
| DELETE | `/users/me/stock-alerts/:productId` | Cancel alert               |

### `POST /users/me/stock-alerts`

**Request body (assumed storefront contract):**

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `productId` | string | yes      |

**Successful response:** JSON body normalised client-side into `StockAlert`:

- `productId` — string
- `product` — embedded `Product` (same camelCase shape as catalogue)
- `createdAt` — ISO 8601 (also accepts snake_case `created_at` until backend is locked)

**Duplicates:** Frontend treats **409 Conflict** like wishlist POST — synthesises `StockAlert` from the PDP `product` snapshot when `{ productId, product }` is known.

**Typical errors:** `401`; `400` if product invalid or alert not allowed (e.g. already in stock) — PDP surfaces message and prompts refresh where appropriate.

### `GET /users/me/stock-alerts`

**Response:** bare `StockAlert[]` **or** `{ items: StockAlert[] }`; client normalises to an array.

**Network unreachable:** storefront dev fallback returns `[]` with a one-shot console warning (`lib/api/stockAlerts.ts`).

### `DELETE /users/me/stock-alerts/:productId`

Idempotent — **404** ignored. **204** supported via `apiFetch`.

---

## Checkout path note (one-time orders)

The route inventory above lists `POST /checkout/session`. The storefront currently calls `POST /checkout` in `lib/api/checkout.ts` (legacy path). **Do not change the checkout module in Phase 16** — align the deployed API with either path and update this doc + `checkout.ts` together in a dedicated follow-up.

---

## Subscriptions (Subscribe & Save) — contract

Aligned with backend Phase 16 Stripe Checkout for subscriptions. All routes require a **logged-in user JWT** unless noted.

### Product eligibility (`GET /products`, `GET /products/:slug`)

Optional embedded object (camelCase JSON):

- `subscription.enabled` — `boolean`; when false/omitted, PDP hides Subscribe & Save.
- `subscription.intervals` — `SubscriptionInterval[]` subset the customer may choose.
- `subscription.discountPercent` — integer percent off the one-time `priceCents` for the subscribe price (UI preview only; backend is canonical).

`SubscriptionInterval` enum (string):

- `2_weeks` | `4_weeks` | `8_weeks` | `12_weeks`

### `POST /subscriptions`

Creates a Stripe Checkout Session for a single-product subscription.

**Request body (JSON):**

| Field               | Type                    | Required                             |
| ------------------- | ----------------------- | ------------------------------------ |
| `productId`         | string                  | yes                                  |
| `quantity`          | number (int ≥ 1)        | yes                                  |
| `interval`          | `SubscriptionInterval`  | yes                                  |
| `successUrl`        | string (absolute https) | yes                                  |
| `cancelUrl`         | string (absolute https) | yes                                  |
| `petId`             | string \| null          | no                                   |
| `clientReferenceId` | string                  | no — Supabase `user.id` when present |

**Response 200:**

| Field       | Type                                                    |
| ----------- | ------------------------------------------------------- |
| `url`       | string — Stripe Checkout URL (`window.location.assign`) |
| `sessionId` | string                                                  |

**Errors (typical):**

- `401` — missing/invalid token.
- `400` — validation / product not subscription-eligible.
- `409` — conflict (e.g. active cart promo/discount incompatible with subscribe checkout).

### `GET /users/me/subscriptions`

**Response:** `Subscription[]` **or** `{ subscriptions: Subscription[] }` **or** `{ items: Subscription[] }` (frontend normalises).

### `GET /users/me/subscriptions/:id`

**Response 200:** `Subscription`. **404** if not found / not owned.

### `PATCH /users/me/subscriptions/:id`

Partial update. Body may include `quantity`, `interval`, `petId` (null clears).

**Response 200:** updated `Subscription`.

### `POST /users/me/subscriptions/:id/pause` / `.../resume`

**Response 200:** updated `Subscription`.

### `DELETE /users/me/subscriptions/:id`

Schedule cancel-at-period-end (not skip-next).

**Response:** Prefer **200** + `Subscription` body so UI can read `cancelAtPeriodEnd`, `currentPeriodEnd`. If the API returns **204**, the client MUST refetch the row or list to refresh UI (`apiFetch` maps 204 to `undefined`).

### `Subscription` resource (camelCase)

| Field                                                        | Notes                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `id`                                                         | string                                                           |
| `productId`, `productSlug`, `productName`, `productImageUrl` | display                                                          |
| `quantity`                                                   | int                                                              |
| `interval`                                                   | `SubscriptionInterval`                                           |
| `unitPriceCents`                                             | subscribe unit price snapshot                                    |
| `status`                                                     | `active` \| `paused` \| `canceled` \| `past_due` \| `incomplete` |
| `cancelAtPeriodEnd`                                          | boolean                                                          |
| `currentPeriodEnd`                                           | ISO 8601 — next renewal or effective cancel date                 |
| `petId`                                                      | optional string \| null                                          |
| `createdAt`                                                  | ISO 8601                                                         |

---

## Admin (JWT + admin role)

| Method | Path                               |
| ------ | ---------------------------------- |
| GET    | `/admin/orders`                    |
| GET    | `/admin/orders/:id`                |
| PATCH  | `/admin/orders/:id/status`         |
| POST   | `/admin/discounts`                 |
| GET    | `/admin/discounts`                 |
| PATCH  | `/admin/products/:id/subscription` |

---

## Admin — Phase 21 analytics, customers, fulfillment

All routes require **JWT + admin role** (same as other admin routes).

### Analytics

| Method | Path                                  | Query                           | Response (camelCase — verify with live API)                                                          |
| ------ | ------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/admin/analytics/overview`           | —                               | Overview KPIs: `revenueCents`, `ordersCount`, `customersCount`, `aovCents`, `currency`, `periodDays` |
| GET    | `/admin/analytics/revenue-timeseries` | `range`: `7d` \| `30d` \| `90d` | `{ currency, points: [{ date, revenueCents, orderCount }] }`                                         |
| GET    | `/admin/analytics/products/top`       | `limit` (optional)              | `{ items: [...] }`                                                                                   |
| GET    | `/admin/analytics/products/low-stock` | `limit` (optional)              | `{ items: [...] }`                                                                                   |
| GET    | `/admin/analytics/subscriptions`      | —                               | Subscription aggregate stats                                                                         |
| GET    | `/admin/analytics/discounts`          | —                               | `{ items: [...] }`                                                                                   |

### Customers

| Method | Path                                 | Query                        | Notes                                    |
| ------ | ------------------------------------ | ---------------------------- | ---------------------------------------- |
| GET    | `/admin/customers`                   | `page`, `pageSize`, `search` | Paginated list                           |
| GET    | `/admin/customers/:id`               | —                            | Customer detail                          |
| GET    | `/admin/customers/:id/orders`        | `page`, `pageSize`           | Customer order history                   |
| GET    | `/admin/customers/:id/subscriptions` | —                            | Array or `{ items }` (client normalises) |

### Fulfillment

| Method | Path                           | Body / query                                            | Notes                                                                                                       |
| ------ | ------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/admin/fulfillment/queue`     | `page`, `pageSize`, `status` (optional)                 | Orders awaiting fulfillment                                                                                 |
| POST   | `/admin/fulfillment/bulk-ship` | `{ orderIds, trackingNumber?, trackingUrl?, carrier? }` | Bulk mark shipped; may return partial failures                                                              |
| PATCH  | `/admin/orders/:id/tracking`   | `{ trackingNumber?, trackingUrl?, carrier? }`           | Tracking updates (Phase 21); status changes remain on `PATCH /admin/orders/:id` or `/status` per deployment |

**Note:** The storefront `petsupplies-web` uses `PATCH /admin/orders/:id` for combined updates in Phase 8; tracking-only edits should use `PATCH /admin/orders/:id/tracking` to match Phase 21.

---

## Not for the browser app (still exposed)

| Method | Path               | Purpose                                                                                   |
| ------ | ------------------ | ----------------------------------------------------------------------------------------- |
| POST   | `/webhooks/stripe` | Stripe → API (raw body + signature)                                                       |
| POST   | `/jobs/run/:name`  | Cron / jobs (abandoned-cart, upcoming-delivery, back-in-stock; CRON bearer, not user JWT) |
