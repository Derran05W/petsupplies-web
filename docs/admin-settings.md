# Admin settings (self-serve storefront)

Admin pages under `/admin/settings/*` edit live storefront content via `petsupplies-api`. After each save the API calls `POST /api/internal/revalidate` on this app to bust ISR cache tags.

## Environment

| Variable                    | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`       | API origin for `/site/*` reads and `/admin/site/*` writes    |
| `INTERNAL_REVALIDATE_TOKEN` | Must match the API — secures `POST /api/internal/revalidate` |

## Pages

| Route                        | Phase  | API endpoints                                                                                                                             |
| ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/settings`            | 1–2    | `GET /site/settings`, `PATCH /admin/site/settings` (shipping + brand)                                                                     |
| `/admin/settings/navigation` | 5      | `GET /site/nav`, `PUT /admin/site/nav/header`, `PUT /admin/site/nav/footer`                                                               |
| `/admin/settings/homepage`   | 3–4, 6 | `PATCH /admin/site/settings`, `PUT /admin/site/featured-products`, `PUT /admin/site/category-strip`, `POST /admin/site/assets/upload-url` |
| `/admin/settings/pages`      | 8      | `GET /admin/site/pages`, `PUT /admin/site/pages/:slug`                                                                                    |
| `/admin/settings/emails`     | 9      | `GET/PUT /admin/site/email-templates/:key`                                                                                                |
| `/admin/discounts`           | 7      | `GET/POST/PATCH/DELETE /admin/discounts`                                                                                                  |

## Storefront reads

Public server components fetch `/site/*` with `next.revalidate: 300` and on-demand tags (`site-settings`, `site-featured`, `site-nav`, `site-category-strip`, `site-pages`). See `lib/api/site/settings.ts` and sibling modules.

When the API is unreachable, build-time defaults in `lib/site/fallbacks.ts` keep the storefront online.
