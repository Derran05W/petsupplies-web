# Deployment

Operational runbook for deploying `petsupplies-web` (Next.js 14) to **Vercel**. This covers the one-time setup a human performs per environment; Vercel's native Git integration handles every deploy after that.

> Secrets are referenced **by name only**. Real values live in the Vercel project env settings and the Supabase / Stripe / Railway dashboards. Never commit `.env*.local`.

---

## Architecture overview

| Environment | Branch   | Vercel target         | API (Railway)                                             | Supabase project  | Stripe |
| ----------- | -------- | --------------------- | --------------------------------------------------------- | ----------------- | ------ |
| Preview     | every PR | Vercel **Preview**    | `petsupplies-api-staging`                                 | staging           | test   |
| Production  | `main`   | Vercel **Production** | `petsupplies-api-prod` (or staging until prod API exists) | prod (or staging) | live   |

Vercel watches the GitHub repo: a push to `main` ships Production, every PR gets a Preview URL. There is no deploy job in GitHub Actions — Vercel owns the deploy path. CI's job (`.github/workflows/ci.yml`) is to fail before a bad commit reaches `main`.

**The current `vercel-deploy` work targets a staging-validated Preview/Production on `*.vercel.app` pointing at the live Railway staging API.** Production cutover (prod Supabase, Railway prod, Stripe live, custom domain) is a later, separate step.

---

## How the frontend reaches the API

`next.config.mjs` rewrites `/api-backend/*` → the API **only when the API URL is loopback** (`localhost` / `127.0.0.1`). On Vercel the API URL is a real HTTPS Railway origin, so:

- **Browser** calls go **directly** to `NEXT_PUBLIC_API_URL` (no proxy). The API's **`FRONTEND_URL`** must exactly match the Vercel origin or browser `fetch` fails CORS (surfaces as "Couldn't reach the server", status 0).
- **Server Components / middleware** call the API URL directly server-side — no CORS, but a wrong URL still breaks SSR data.

`NEXT_PUBLIC_*` values are **inlined at build time**. Changing any of them requires a **redeploy**, not just an env-var save.

---

## First-time Vercel setup

1. **Import** `Derran05W/petsupplies-web` into Vercel (correct team/owner).
2. **Framework preset:** Next.js (auto-detected).
3. **Build settings:** Install `pnpm install`, Build `pnpm build`, Output: Next.js default. **Node 20**.
4. **Production branch:** `main`.
5. **Environment variables:** set the table below for **Production** and **Preview** (use staging values for both until prod cutover).
6. **Deploy** — Vercel builds and assigns an origin (e.g. `petsupplies-web.vercel.app`).
7. Complete the **cross-service wiring** below, then redeploy if you changed any `NEXT_PUBLIC_*`.

---

## Environment variables (Vercel)

### Required

| Variable                             | Scope           | Notes                                                        |
| ------------------------------------ | --------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`           | Build + runtime | Supabase project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Build + runtime | Supabase anon/publishable key                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Build + runtime | `pk_test_…` (staging) / `pk_live_…` (prod)                   |
| `NEXT_PUBLIC_API_URL`                | Build + runtime | Railway API origin, **no trailing slash**                    |
| `INTERNAL_REVALIDATE_TOKEN`          | Runtime only    | Shared secret for `POST /api/internal/revalidate`; match API |

Staging API origin: `https://petsupplies-api-staging-production.up.railway.app`

### Optional

| Variable                                    | Default | Notes                                                    |
| ------------------------------------------- | ------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS` | `5000`  | Bootstrap only — canonical value is `GET /site/settings` |

---

## Cross-service wiring (do after the first deploy)

### Railway API (per service)

- Set `FRONTEND_URL` to the Vercel origin for that environment (CORS + Stripe success/cancel URLs).
- Set the same `INTERNAL_REVALIDATE_TOKEN` as Vercel.
- Redeploy the Railway service so the env change takes effect.

### Supabase (Authentication → URL Configuration)

- **Site URL:** the Vercel origin.
- **Redirect URLs** (add all that apply):
  - `http://localhost:3000/api/auth/callback`
  - `https://<vercel-production-domain>/api/auth/callback`
  - `https://*.vercel.app/api/auth/callback` (preview wildcard)
  - any custom-domain callback
- Confirm the `sync_auth_user` trigger is applied (see `petsupplies-api/docs/deployment.md`).
- Promote an admin: `app_metadata.role = 'ADMIN'` and/or SQL `UPDATE public."User" SET role = 'ADMIN'`.

---

## CI secrets (GitHub Actions)

CI builds with `NEXT_PUBLIC_*` from repo secrets, falling back to placeholders so fork PRs stay green. For CI to validate a **real** build:

| Secret                               | Status / action                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | present                                                                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | **add** — repo currently has `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (name mismatch; CI reads `ANON_KEY`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | present                                                                                                  |
| `STAGING_API_URL`                    | present (used as build `NEXT_PUBLIC_API_URL`)                                                            |
| `STAGING_FRONTEND_URL`               | **set** to the Vercel Preview origin so e2e runs against the deployment instead of a local server        |

---

## Smoke test (run on the Preview URL before promoting)

1. **Storefront** — `/` hero + featured products load **real** API data (not placeholders); `/products`, `/products/[slug]`, search/filter.
2. **Auth** — email signup → confirmation link lands on `/api/auth/callback`; Google OAuth round-trip; `/account`, `/admin`, `/checkout` redirect to login when signed out.
3. **Commerce** — signed-in add-to-cart → `/checkout` → shipping rates → Stripe **test** redirect → `/checkout/success?session_id=…` shows the order; confirm the Railway webhook received `checkout.session.completed`.
4. **Admin** — `/admin` with an ADMIN user; a settings save busts ISR cache (homepage reflects the change within the revalidate TTL).
5. **Failure modes** — a wrong `NEXT_PUBLIC_API_URL` surfaces an error, not silent stale data; a wrong API `FRONTEND_URL` causes CORS/status-0; a missing anon key 500s middleware on every request.

---

## Rollback

- Vercel keeps every deployment. Use **Vercel → Deployments → ⋯ → Promote to Production** to instantly roll back to a known-good build.
- Env-var changes only take effect on the **next** deploy; after editing, trigger a redeploy.

---

## Production cutover (later, separate change)

1. Create / confirm `petsupplies-api-prod` Railway service and its URL.
2. Set Production-scoped Vercel env to prod Supabase, prod API URL, Stripe **live** key.
3. Add prod Supabase redirect URLs; apply trigger; promote prod admin.
4. Register the **live** Stripe webhook → prod Railway `/webhooks/stripe`.
5. Bind the custom domain in Vercel and add its `/api/auth/callback` to Supabase.
