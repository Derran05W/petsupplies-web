# petsupplies-api — route inventory (notes)

Reference snapshot for aligning the storefront (`petsupplies-web`) with the backend. Mirrors the backend's `API endpoints` doc (single inventory of HTTP routes mounted by `src/app.ts` in the API repo). Update this file when the API surface changes.

**Contract summary (enums, query mapping, fallbacks):** [api-contracts.md](./api-contracts.md).

**Customer storefront:** use everything except `/admin/*`, `/webhooks/*`, and `/jobs/*`.
**Admin UI:** two gates must align — see [docs/admin-access.md](./admin-access.md).

- **Web gate:** Supabase metadata (`app_metadata.role` preferred; legacy `user_metadata.role` until migration — [migrate-admin-role-to-app-metadata.sql](./supabase/migrate-admin-role-to-app-metadata.sql)).
- **API gate:** `public."User".role = 'ADMIN'` in Postgres. After petsupplies-api admin-access fix, JWT `app_metadata.role` can promote the DB row on first `/admin/*` request.
  **Frontend never calls:** Stripe webhook and cron job endpoints (server-to-server only).

---

## Environments

| Surface             | URL / variable                                                      | Notes                                                                                     |
| ------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Web (Next.js)**   | `NEXT_PUBLIC_API_URL` in `.env.local`                               | No trailing slash. Inlined at `next dev` / `next build` start — restart after changes.    |
| **API (Railway)**   | Your service’s `*.up.railway.app` domain from the Railway dashboard | `GET /health` → `{ "status": "ok" }`. Stale URLs return `"Application not found"`.        |
| **API (local dev)** | `http://localhost:3001`                                             | Default when `NEXT_PUBLIC_API_URL` is unset in [lib/api/client.ts](../lib/api/client.ts). |
| **CORS**            | API env `FRONTEND_URL`                                              | Must match the browser origin exactly (e.g. `http://localhost:3000` for local admin UI).  |

Admin product images use **presigned upload** via `POST /admin/products/images/upload-url` (API creates the signed URL; browser PUTs to Supabase). The web app does not upload directly to Storage for admin products — see [lib/api/admin/product-images.ts](../lib/api/admin/product-images.ts).

---

## Legend

| Column   | Meaning                                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** | `none` — public; `user` — `Authorization: Bearer <Supabase JWT>`; `admin` — JWT + admin role; `stripe` — Stripe signature on raw body; `cron` — `Bearer <CRON_BEARER>` |

---

## Health

| Method | Path      | Auth |
| ------ | --------- | ---- |
| GET    | `/health` | none |

---

## Webhooks (server only)

| Method | Path               | Auth                                 |
| ------ | ------------------ | ------------------------------------ |
| POST   | `/webhooks/stripe` | Stripe `stripe-signature` (raw body) |

---

## Products & catalog reviews

Mounted at `/products`. Listing and detail are public; creating a review requires login.

| Method | Path                      | Auth |
| ------ | ------------------------- | ---- |
| GET    | `/products`               | none |
| GET    | `/products/:slug`         | none |
| GET    | `/products/:slug/reviews` | none |
| POST   | `/products/:slug/reviews` | user |

**`GET /products/:slug/reviews` query:** `page` (default `1`), `limit` (default `20`, max `100`), `sort` — `newest` | `oldest` | `rating_desc` | `rating_asc`. Response: `{ data, page, limit, total, totalPages }` — mapped to storefront `ReviewListResponse` in [lib/api/reviews.ts](../lib/api/reviews.ts). PDP URL keys: `reviewsPage`, `reviewsSort`; legacy `recent` / `helpful` → `newest` in [lib/utils/searchParams.ts](../lib/utils/searchParams.ts).

Listing filters: query params per `listQuerySchema` on the backend.

---

## Cart

Mounted at `/cart`. All routes require auth.

| Method | Path              | Auth |
| ------ | ----------------- | ---- |
| GET    | `/cart`           | user |
| POST   | `/cart/items`     | user |
| PATCH  | `/cart/items/:id` | user |
| DELETE | `/cart/items/:id` | user |
| POST   | `/cart/discount`  | user |
| DELETE | `/cart/discount`  | user |
| DELETE | `/cart`           | user |

---

## Checkout & shipping

| Method | Path                | Auth |
| ------ | ------------------- | ---- |
| POST   | `/checkout/session` | user |
| POST   | `/shipping/quote`   | user |

> **Checkout:** the storefront calls `POST /checkout/session` from [lib/api/checkout.ts](../lib/api/checkout.ts). See [api-contracts.md](./api-contracts.md).

---

## Subscribe & Save (checkout)

Mounted at `/subscriptions` — creates a Stripe subscription checkout for the authenticated user.

| Method | Path             | Auth |
| ------ | ---------------- | ---- |
| POST   | `/subscriptions` | user |

---

## Orders (customer)

Mounted at `/orders`.

| Method | Path          | Auth |
| ------ | ------------- | ---- |
| GET    | `/orders`     | user |
| GET    | `/orders/:id` | user |

**`GET /orders` query:** `page` (default `1`), `limit` (default `20`, max `100`), `status` optional — `PENDING` | `PAID` | `SHIPPED` | `FULFILLED` | `CANCELLED`.

**`GET /orders` response:** `{ data, page, limit, total, totalPages }` — orders newest first (`createdAt` desc). The web app maps this to `OrderListResponse` (`data` → `orders`, `limit` → `pageSize`) in [lib/api/orders.ts](../lib/api/orders.ts).

---

## Reviews (authenticated user's edits)

Mounted at `/reviews` — update/delete **your** review by review id (not product slug).

| Method | Path           | Auth |
| ------ | -------------- | ---- |
| PATCH  | `/reviews/:id` | user |
| DELETE | `/reviews/:id` | user |

---

## Current user profile

Mounted at `/users`.

| Method | Path        | Auth |
| ------ | ----------- | ---- |
| GET    | `/users/me` | user |
| PATCH  | `/users/me` | user |

---

## Saved addresses

Mounted at `/users/me/addresses`.

| Method | Path                              | Auth |
| ------ | --------------------------------- | ---- |
| GET    | `/users/me/addresses`             | user |
| POST   | `/users/me/addresses`             | user |
| PATCH  | `/users/me/addresses/:id`         | user |
| DELETE | `/users/me/addresses/:id`         | user |
| POST   | `/users/me/addresses/:id/default` | user |

---

## Wishlist

Mounted at `/users/me/wishlist`.

| Method | Path                            | Auth |
| ------ | ------------------------------- | ---- |
| GET    | `/users/me/wishlist`            | user |
| POST   | `/users/me/wishlist`            | user |
| DELETE | `/users/me/wishlist/:productId` | user |

---

## Back-in-stock alerts

Mounted at `/users/me/stock-alerts`.

| Method | Path                                | Auth |
| ------ | ----------------------------------- | ---- |
| GET    | `/users/me/stock-alerts`            | user |
| POST   | `/users/me/stock-alerts`            | user |
| DELETE | `/users/me/stock-alerts/:productId` | user |

### `POST /users/me/stock-alerts`

**Request body (assumed storefront contract):**

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `productId` | string | yes      |

**Successful response:** JSON body normalised client-side into `StockAlert`:

- `productId` — string
- `product` — embedded `Product` (same camelCase shape as catalogue)
- `createdAt` — ISO 8601 (also accepts snake_case `created_at` until backend is locked)

**Duplicates:** frontend treats **409 Conflict** like wishlist POST — synthesises `StockAlert` from the PDP `product` snapshot when `{ productId, product }` is known.

**Typical errors:** `401`; `400` if product invalid or alert not allowed (e.g. already in stock) — PDP surfaces message and prompts refresh where appropriate.

### `GET /users/me/stock-alerts`

**Response:** bare `StockAlert[]` **or** `{ items: StockAlert[] }`; client normalises to an array.

**Network unreachable:** storefront dev fallback returns `[]` with a one-shot console warning (`lib/api/stockAlerts.ts`).

### `DELETE /users/me/stock-alerts/:productId`

Idempotent — **404** ignored. **204** supported via `apiFetch`.

---

## Pet profiles

Mounted at `/users/me/pets`.

| Method | Path                 | Auth |
| ------ | -------------------- | ---- |
| GET    | `/users/me/pets`     | user |
| GET    | `/users/me/pets/:id` | user |
| POST   | `/users/me/pets`     | user |
| PATCH  | `/users/me/pets/:id` | user |
| DELETE | `/users/me/pets/:id` | user |

---

## Subscriptions (customer lifecycle)

Mounted at `/users/me/subscriptions`.

| Method | Path                                 | Auth |
| ------ | ------------------------------------ | ---- |
| GET    | `/users/me/subscriptions`            | user |
| GET    | `/users/me/subscriptions/:id`        | user |
| PATCH  | `/users/me/subscriptions/:id`        | user |
| POST   | `/users/me/subscriptions/:id/pause`  | user |
| POST   | `/users/me/subscriptions/:id/resume` | user |
| DELETE | `/users/me/subscriptions/:id`        | user |

### Subscribe & Save — contract

Aligned with backend Stripe Checkout for subscriptions.

#### Product eligibility (`GET /products`, `GET /products/:slug`)

Optional embedded object (camelCase JSON):

- `subscription.enabled` — `boolean`; when false/omitted, PDP hides Subscribe & Save.
- `subscription.intervals` — `SubscriptionInterval[]` subset the customer may choose.
- `subscription.discountPercent` — integer percent off the one-time `priceCents` for the subscribe price (UI preview only; backend is canonical).

`SubscriptionInterval` enum (string): `2_weeks` | `4_weeks` | `8_weeks` | `12_weeks`.

#### `POST /subscriptions`

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

#### `GET /users/me/subscriptions`

**Response:** `Subscription[]` **or** `{ subscriptions: Subscription[] }` **or** `{ items: Subscription[] }` (frontend normalises).

#### `GET /users/me/subscriptions/:id`

**Response 200:** `Subscription`. **404** if not found / not owned.

#### `PATCH /users/me/subscriptions/:id`

Partial update. Body may include `quantity`, `interval`, `petId` (null clears). **Response 200:** updated `Subscription`.

#### `POST /users/me/subscriptions/:id/pause` / `.../resume`

**Response 200:** updated `Subscription`.

#### `DELETE /users/me/subscriptions/:id`

Schedule cancel-at-period-end (not skip-next).

**Response:** Prefer **200** + `Subscription` body so UI can read `cancelAtPeriodEnd`, `currentPeriodEnd`. If the API returns **204**, the client MUST refetch the row or list to refresh UI (`apiFetch` maps 204 to `undefined`).

#### `Subscription` resource (camelCase)

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

## Scheduled jobs (cron / infra)

Mounted at `/jobs`. Not for browser clients.

| Method | Path                          | Auth |
| ------ | ----------------------------- | ---- |
| POST   | `/jobs/run/abandoned-cart`    | cron |
| POST   | `/jobs/run/upcoming-delivery` | cron |
| POST   | `/jobs/run/back-in-stock`     | cron |

Unknown `:name` returns `404`.

---

## Admin

All routes under `/admin` require **admin** auth (`auth` + `adminOnly`).

### Analytics (`/admin/analytics`)

| Method | Path                                  | Auth  |
| ------ | ------------------------------------- | ----- |
| GET    | `/admin/analytics/overview`           | admin |
| GET    | `/admin/analytics/revenue-timeseries` | admin |
| GET    | `/admin/analytics/products/top`       | admin |
| GET    | `/admin/analytics/products/low-stock` | admin |
| GET    | `/admin/analytics/subscriptions`      | admin |
| GET    | `/admin/analytics/discounts`          | admin |

Storefront response shapes (camelCase — verify with live API):

| Path                                  | Query                           | Response                                                                                             |
| ------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/admin/analytics/overview`           | —                               | Overview KPIs: `revenueCents`, `ordersCount`, `customersCount`, `aovCents`, `currency`, `periodDays` |
| `/admin/analytics/revenue-timeseries` | `range`: `7d` \| `30d` \| `90d` | `{ currency, points: [{ date, revenueCents, orderCount }] }`                                         |
| `/admin/analytics/products/top`       | `limit` (optional)              | `{ items: [...] }`                                                                                   |
| `/admin/analytics/products/low-stock` | `limit` (optional)              | `{ items: [...] }`                                                                                   |
| `/admin/analytics/subscriptions`      | —                               | Subscription aggregate stats                                                                         |
| `/admin/analytics/discounts`          | —                               | `{ items: [...] }`                                                                                   |

### Customers (`/admin/customers`)

| Method | Path                                 | Auth  |
| ------ | ------------------------------------ | ----- |
| GET    | `/admin/customers`                   | admin |
| GET    | `/admin/customers/:id`               | admin |
| GET    | `/admin/customers/:id/orders`        | admin |
| GET    | `/admin/customers/:id/subscriptions` | admin |

Storefront query/notes:

| Path                                 | Query                        | Notes                                    |
| ------------------------------------ | ---------------------------- | ---------------------------------------- |
| `/admin/customers`                   | `page`, `pageSize`, `search` | Paginated list                           |
| `/admin/customers/:id`               | —                            | Customer detail                          |
| `/admin/customers/:id/orders`        | `page`, `pageSize`           | Customer order history                   |
| `/admin/customers/:id/subscriptions` | —                            | Array or `{ items }` (client normalises) |

### Fulfillment (`/admin/fulfillment`)

| Method | Path                           | Auth  |
| ------ | ------------------------------ | ----- |
| GET    | `/admin/fulfillment/queue`     | admin |
| POST   | `/admin/fulfillment/bulk-ship` | admin |

Storefront body/query:

| Path                           | Body / query                                            | Notes                                          |
| ------------------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| `/admin/fulfillment/queue`     | `page`, `pageSize`, `status` (optional)                 | Orders awaiting fulfillment                    |
| `/admin/fulfillment/bulk-ship` | `{ orderIds, trackingNumber?, trackingUrl?, carrier? }` | Bulk mark shipped; may return partial failures |

### Products — CRUD & images (`/admin/products`)

| Method | Path                                  | Auth  |
| ------ | ------------------------------------- | ----- |
| POST   | `/admin/products/images/upload-url`   | admin |
| GET    | `/admin/products`                     | admin |
| POST   | `/admin/products`                     | admin |
| GET    | `/admin/products/:id`                 | admin |
| PATCH  | `/admin/products/:id`                 | admin |
| DELETE | `/admin/products/:id`                 | admin |
| POST   | `/admin/products/:id/images`          | admin |
| PATCH  | `/admin/products/:id/images/reorder`  | admin |
| PATCH  | `/admin/products/:id/images/:imageId` | admin |
| DELETE | `/admin/products/:id/images/:imageId` | admin |

**List query (Phase 26):** `page`, `limit`, `q`, `category` (`ProductCategory` enum), `active` (`true` \| `false`).

**Create / PATCH body:** `name`, `slug?`, `description`, `price` (cents), `stock`, `category`, `active`, `tags`, `imageUrl`, optional package fields (`weightGrams`, `lengthCm`, …). Do **not** send `subscriptionEligible` on POST/PATCH — use `PATCH /admin/products/:id/subscription`.

**DELETE response:** `{ "deleted": "soft" | "hard" }`.

**Upload URL body:** `{ "filename", "contentType" }` → `{ uploadUrl, token, objectKey, publicUrl, maxBytes }`.

**Attach image body:** `{ url, altText?, sortOrder?, isPrimary? }`.

### Product shipping package & Subscribe & Save setup

Same `/admin/products` prefix; implemented on the top-level `adminRouter` (not the nested products router).

| Method | Path                               | Auth  |
| ------ | ---------------------------------- | ----- |
| PATCH  | `/admin/products/:id/package`      | admin |
| PATCH  | `/admin/products/:id/subscription` | admin |

### Orders & discounts (`/admin`)

| Method | Path                         | Auth  |
| ------ | ---------------------------- | ----- |
| GET    | `/admin/orders`              | admin |
| GET    | `/admin/orders/:id`          | admin |
| PATCH  | `/admin/orders/:id/status`   | admin |
| PATCH  | `/admin/orders/:id/tracking` | admin |
| POST   | `/admin/discounts`           | admin |
| GET    | `/admin/discounts`           | admin |

**Note:** the storefront historically used `PATCH /admin/orders/:id` for combined updates; tracking-only edits should use `PATCH /admin/orders/:id/tracking` and status-only edits `PATCH /admin/orders/:id/status` to match the current backend.

---

## Maintaining this file

When the backend adds or removes routes under `src/routes/` or changes mounts in `src/app.ts`, update this document in the same storefront PR that consumes the change.
