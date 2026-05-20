# Admin access setup

The admin console uses **two authorization layers**. Both must be configured or you will see the shell but API panels return **403 Forbidden** / “Unauthorized”.

| Layer                              | What it checks                                                  | Where                                                            |
| ---------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Web**                            | Supabase JWT `app_metadata.role` (legacy: `user_metadata.role`) | Next.js `middleware.ts`, `app/admin/layout.tsx`                  |
| **API**                            | Postgres `public."User".role = 'ADMIN'`                         | petsupplies-api `adminOnly` middleware                           |
| **Storage** (legacy direct upload) | JWT `app_metadata.role` in RLS                                  | Supabase bucket `product-images` — see `lib/supabase/storage.ts` |

After the API **admin-access fix** is deployed, setting **`app_metadata.role = 'ADMIN'`** on an existing `public."User"` row is enough for the **first** `/admin/*` request to promote `User.role` to `ADMIN`. SQL promotion below remains valid and is required if you only set `user_metadata.role`.

---

## 1. User sync trigger (required once per Supabase project)

The API does not create `public."User"` rows. Apply the trigger from the API repo:

[`petsupplies-api/supabase/triggers/sync_auth_user.sql`](https://github.com/Derran05W/petsupplies-api/blob/main/supabase/triggers/sync_auth_user.sql)

Run in Supabase → SQL Editor. The user must exist in **Authentication → Users** before a `public."User"` row appears.

---

## 2. Set `app_metadata.role` (required)

Storage RLS and API self-heal read **`app_metadata`**, not client-editable `user_metadata`.

**Option A — migration SQL** (if role is only in `user_metadata`):

[`docs/supabase/migrate-admin-role-to-app-metadata.sql`](./supabase/migrate-admin-role-to-app-metadata.sql)

**Option B — direct update:**

```sql
UPDATE auth.users
SET raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
WHERE email = 'your@email.com';
```

---

## 3. Set `public.User.role` (API gate)

Run in Supabase SQL Editor (same project as API `DATABASE_URL`):

```sql
UPDATE public."User"
   SET role = 'ADMIN'
 WHERE email = 'your@email.com';
```

Skip if API self-heal already ran after step 2 and a successful admin API call.

---

## 4. Sign out and sign in

Refresh the JWT so `app_metadata.role` is present in the access token.

---

## 5. Admin product images (Storage)

Image upload uses `POST /admin/products/images/upload-url` on the API, then a browser PUT to Supabase Storage.

**502 on upload-url** almost always means the Storage bucket does not exist:

1. Supabase dashboard → **Storage** → **New bucket**
2. Name: **`product-images`** (or set `SUPABASE_STORAGE_BUCKET` in petsupplies-api `.env` to match)
3. Enable **Public bucket** (storefront reads image URLs)
4. API `.env` must include `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` for the same project

After creating the bucket, retry upload (no API code change required).

---

## 6. Environment checklist

| Variable                                | Repo | Notes                                                                                 |
| --------------------------------------- | ---- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                   | web  | e.g. `http://localhost:3001` — restart `next dev` after change                        |
| `SUPABASE_JWT_SECRET`                   | api  | Required only for **legacy HS256** projects; ES256/RS256 use JWKS from `SUPABASE_URL` |
| `FRONTEND_URL`                          | api  | Must match browser origin exactly (CORS), e.g. `http://localhost:3000`                |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | web  | Same Supabase project as API                                                          |

**JWT algorithm:** Decode an access token (local dev only). If header `alg` is **ES256** or **RS256**, the API verifies via `SUPABASE_URL/auth/v1/.well-known/jwks.json` — `SUPABASE_JWT_SECRET` alone will not work. Sign-out/in does not fix algorithm mismatch.

---

## 7. Verify

1. `GET <API>/health` → `{ "status": "ok" }`
2. Sign in as admin → open `/admin`
3. Browser Network: `GET /admin/analytics/overview` → **200**
4. Or:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer <access_token>" \
  http://localhost:3001/admin/analytics/overview
```

Expect `200`.

---

## 8. Troubleshooting

| Symptom                                        | Likely cause                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `/admin` loads, panels show 403 / setup banner | Metadata ADMIN but `User.role` still `CUSTOMER` — run §3 or deploy API self-heal |
| 401 on all admin APIs                          | Missing Bearer, wrong `SUPABASE_JWT_SECRET`, or expired session                  |
| “Couldn't reach the server”                    | API down or wrong `NEXT_PUBLIC_API_URL`                                          |
| **502** on `…/images/upload-url`               | Missing Storage bucket `product-images` — see §5                                 |
| Only `user_metadata.role` set                  | Web may load; API 403 and Storage deny — run §2                                  |
