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

| Concern        | Storefront                                   | Backend                                       |
| -------------- | -------------------------------------------- | --------------------------------------------- |
| Create session | `POST /checkout/session`                     | [lib/api/checkout.ts](../lib/api/checkout.ts) |
| Poll order     | `GET /orders/by-checkout-session/:sessionId` | unchanged                                     |

## Orders (account)

| API field     | Storefront field         | Mapper                                                              |
| ------------- | ------------------------ | ------------------------------------------------------------------- |
| `data`        | `orders`                 | [lib/api/orders.ts](../lib/api/orders.ts) `mapApiOrderListResponse` |
| `limit`       | `pageSize`               | same                                                                |
| Query `limit` | `GetOrdersOptions.limit` | sent as `limit`                                                     |

## Reviews (user edits)

`PATCH` / `DELETE` `/reviews/:id` — auth required; types in [types/review.ts](../types/review.ts).

## Dev fallbacks (remove when API is stable on staging)

| Module                | Trigger                 | Behavior                                 |
| --------------------- | ----------------------- | ---------------------------------------- |
| `lib/api/products.ts` | Network error           | `FEATURED_PRODUCTS` filter               |
| `lib/api/checkout.ts` | Network error           | Placeholder Stripe session               |
| `lib/api/reviews.ts`  | `E2E_REVIEWS_FIXTURE=1` | Deterministic review list for Playwright |
