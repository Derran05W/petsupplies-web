# petsupplies-web — Frontend Plan

## Overview
Next.js 14 (App Router) e-commerce frontend for a pet supplies business operating under the
placeholder brand **"pawsupply"** (name is intentionally easy to swap — all brand strings live
in `lib/config/brand.ts` so a single file change renames the entire site).
Integrates with `petsupplies-api` for data and Stripe for checkout.
Supports desktop and mobile. Deployed on Vercel (preview per PR, prod on main).
Includes a protected `/admin` route group for the business owner to manage products and orders,
with an AI-powered product description generator.

---

## Tech Stack
| Concern | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Auth | Supabase Auth (via @supabase/ssr) |
| Payments | Stripe.js + @stripe/react-stripe-js |
| State | Zustand (cart) + React Query (server state) |
| Forms | React Hook Form + Zod |
| Testing (unit) | Vitest + @testing-library/react |
| Testing (e2e) | Playwright |
| Linting | ESLint (eslint-config-next + strict TS rules) |
| Formatting | Prettier |
| Pre-commit | Husky + lint-staged + commitlint |
| Env management | Nix + direnv |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

---

## Brand Configuration
All brand strings are centralised so the business name can be changed in one place.

**File: `lib/config/brand.ts`**
```ts
export const brand = {
  name: 'pawsupply',           // display name in nav, footer, page titles
  tagline: "Food they'll actually love.",
  description: 'Thoughtfully sourced, vet-approved nutrition for every pet.',
  supportEmail: 'hello@pawsupply.com',
  social: {
    instagram: '',
    facebook: '',
  },
} as const;
```

To rename the business: update `brand.name` and `brand.tagline` only. Nothing else needs changing.

---

## Design System

### Design Philosophy
Warm, friendly, and full of personality — but clean and uncluttered. Think a well-loved
independent pet shop with excellent taste. Not sterile. Not corporate. Confident typography
with italic accents, generous whitespace, warm off-white surfaces, and a vibrant green palette
that feels alive rather than clinical.

### Color Palette
Implement as CSS variables in `app/globals.css` and as a Tailwind theme extension.

```css
:root {
  /* Brand greens — warm and vibrant, not muted */
  --color-brand-50:  #EDFAF2;
  --color-brand-100: #C6F0D8;
  --color-brand-200: #8CDDB0;
  --color-brand-300: #4DC480;
  --color-brand-400: #25A85E;   /* primary CTA background */
  --color-brand-500: #1A8C4E;   /* hover state */
  --color-brand-600: #136B3B;   /* dark text on light green bg */
  --color-brand-700: #0D4D2A;   /* deepest green, nav logo accent */

  /* Warm neutrals — off-white, not stark white */
  --color-warm-50:  #FDFBF7;   /* page background */
  --color-warm-100: #F7F3EC;   /* product card / hero right panel */
  --color-warm-200: #EDE8DF;   /* subtle dividers, pill backgrounds */
  --color-warm-300: #D9D2C5;   /* borders */
  --color-warm-400: #B8AFA0;   /* muted text */
  --color-warm-600: #6B6059;   /* secondary text */
  --color-warm-900: #1E1A16;   /* primary text */
}
```

### Typography
Use **Fraunces** (Google Fonts) as the display/heading font — a warm, optical serif with
beautiful italics and personality. Pair with **DM Sans** for body and UI text.

```ts
// app/layout.tsx font imports
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});
```

**Typography rules:**
- All `h1`, `h2` on marketing pages use `font-display` (Fraunces)
- Hero headline uses italic Fraunces for the accent word: `<em className="italic text-brand-400">`
- Body copy, nav links, labels, buttons use DM Sans
- Heading weights: 400 for large display text, 500 for UI headings
- Letter spacing: `-0.02em` to `-0.03em` on large headings, `0.08em` on small uppercase labels
- Never use font-weight 700+ on display text

### tailwind.config.ts
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EDFAF2',
          100: '#C6F0D8',
          200: '#8CDDB0',
          300: '#4DC480',
          400: '#25A85E',
          500: '#1A8C4E',
          600: '#136B3B',
          700: '#0D4D2A',
        },
        warm: {
          50:  '#FDFBF7',
          100: '#F7F3EC',
          200: '#EDE8DF',
          300: '#D9D2C5',
          400: '#B8AFA0',
          600: '#6B6059',
          900: '#1E1A16',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### Component Aesthetic Rules
These rules apply to every component without exception.

**Buttons:**
- Primary: `bg-brand-400 hover:bg-brand-500 text-white rounded-lg px-5 py-2.5 text-sm font-body`
- Secondary: `border border-warm-300 bg-transparent hover:bg-warm-100 rounded-lg px-5 py-2.5 text-sm`
- Never use `rounded-full` on main CTAs

**Cards:**
- Product cards: `bg-white rounded-xl border border-warm-200 hover:border-warm-300 transition-colors`
- Product image area: `bg-warm-100 rounded-lg`
- Hover: subtle `shadow-sm` lift

**Pills / badges:**
- Category pills: `bg-brand-50 text-brand-600 text-xs font-medium px-2.5 py-1 rounded-md`

**Forms:**
- Inputs: `border border-warm-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white`

**Navigation:**
- Sticky with `backdrop-blur-sm bg-warm-50/90`
- Logo uses DM Sans 500, accent word in brand-600

**Spacing:**
- Section padding: `py-16 px-6 md:px-8 lg:px-12`
- Card grid gap: `gap-5`

### Page-by-Page Design Spec

#### Homepage
1. **Navbar** — sticky, logo left, links center, search + cart icons right
2. **Hero** — two-column grid (desktop), stacked (mobile)
   - Left: eyebrow label, Fraunces headline with italic green accent word, subtext, two CTAs
   - Right: `bg-warm-100` panel with lifestyle photo of real pet enjoying product (next/image with blur placeholder). Tag card bottom-left: "Free shipping on orders over $50"
   - Mobile: image panel below text
3. **Category strip** — horizontal scroll pills: All, Dogs, Cats, Birds, Small Animals
4. **Featured products grid** — 3-col desktop, 2-col tablet, 1-col mobile
5. **Brand values strip** — Free shipping / Vet approved / Easy returns
6. **Footer** — logo, tagline, links, copyright

#### Product listing (`/products`)
- Sticky filter sidebar desktop (category, price, pet type)
- Skeleton loading states while fetching
- Empty state with friendly illustration

#### Product detail (`/products/[slug]`)
- Two-column: large image left (`bg-warm-100` container), info right
- Category pill, Fraunces name, price, description, quantity control, "Add to cart" CTA
- Nutritional info accordion below fold
- "You might also like" row at bottom

#### Cart
- Slide-in drawer on desktop, full page on mobile
- CartItem: thumbnail, name, qty controls, line price, remove
- CartSummary: subtotal, shipping note, checkout CTA

#### Auth pages
- Centered card, `bg-warm-50` background
- Fraunces heading, DM Sans fields
- Google OAuth button below divider
- Minimal header (logo only)

#### Admin (`/admin`)
Protected: middleware checks `role === 'ADMIN'` from Supabase JWT. Redirect non-admins to `/`.

Layout: fixed left sidebar (180px) + main content.

Sidebar: Dashboard, Products, Orders, Customers, Analytics

**`/admin/products`:** table with name, category, price, stock, status pill, Edit button, "✨ Generate description" AI button

**`/admin/products/new` and `[id]/edit`:**
- Fields: name, slug (auto-generated, editable), price, stock, category, pet type, active toggle
- Image upload: drag-and-drop → Supabase Storage → saves URL
- Description textarea + "✨ Generate with AI" button
  - Calls `POST /admin/products/generate-description` with `{ name, category, petType, ingredients }`
  - Streams response into textarea character by character
  - Admin edits before saving

**`/admin/orders`:** full order table, click row → detail modal

### Mobile Responsiveness
Mobile-first Tailwind. Key rules:
- Default = mobile, `md:` = tablet (768px), `lg:` = desktop (1024px)
- Navbar: hamburger + cart on mobile, `MobileMenu` full-screen overlay slides from right
- Hero: image below text on mobile
- Admin sidebar: bottom tab bar on mobile
- Cart: always full-page on mobile

### Animation
Keep subtle and purposeful:
- Product card hover: `transition-all duration-200` shadow lift only
- Cart badge: brief bounce when item added
- Skeleton: shadcn/ui Skeleton shimmer
- AI generation: spinner → text fades in as stream arrives
- Mobile menu: `transition-transform duration-300 ease-in-out`

---

## Folder Structure
```
petsupplies-web/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── e2e.yml
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (shop)/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   └── checkout/
│   │       ├── page.tsx
│   │       └── success/page.tsx
│   ├── account/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx           # Sidebar + role guard
│   │   ├── page.tsx             # Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── api/
│   │   └── auth/callback/route.ts
│   ├── layout.tsx               # Root: fonts, providers
│   ├── globals.css              # CSS variables, Tailwind base
│   └── not-found.tsx
├── components/
│   ├── ui/                      # shadcn/ui — do not edit manually
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductSkeleton.tsx
│   │   └── CategoryStrip.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   └── CheckoutForm.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── admin/
│       ├── ProductForm.tsx
│       ├── ImageUploader.tsx    # Supabase Storage drag-and-drop
│       ├── AiDescriptionBtn.tsx # Streaming AI description
│       └── OrderTable.tsx
├── lib/
│   ├── config/
│   │   └── brand.ts             # ALL brand strings — single source of truth
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── storage.ts           # Storage upload helpers
│   ├── stripe/
│   │   └── client.ts
│   ├── api/
│   │   └── client.ts
│   ├── store/
│   │   └── cart.ts
│   └── utils.ts
├── hooks/
│   ├── useCart.ts
│   ├── useAuth.ts
│   └── useProducts.ts
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── user.ts
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── ProductCard.test.tsx
│   │   │   └── CartItem.test.tsx
│   │   └── lib/utils.test.ts
│   └── e2e/
│       ├── homepage.spec.ts
│       ├── checkout.spec.ts
│       └── auth.spec.ts
├── public/
│   └── images/
│       └── hero-placeholder.jpg
├── flake.nix
├── .envrc
├── .env.local.example
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── .eslintrc.json
├── .prettierrc
├── commitlint.config.js
├── lint-staged.config.js
└── package.json
```

---

## Environment Variables (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## flake.nix
```nix
{
  description = "petsupplies-web dev environment";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in {
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.nodejs_20 pkgs.nodePackages.pnpm ];
          shellHook = ''echo "Node: $(node --version)"'';
        };
      });
}
```

`.envrc`: `use flake`

---

## GitHub Actions — CI (.github/workflows/ci.yml)
```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  commitlint:
    name: Lint commit messages
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose

  lint:
    name: Lint + format check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    name: TypeScript type check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check

  unit-tests:
    name: Unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: unit-coverage
          path: coverage/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, unit-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}

  e2e:
    name: E2E tests
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
        env:
          BASE_URL: ${{ secrets.STAGING_FRONTEND_URL }}
```

---

## Phase Tracker

Tick each phase as it lands. Each phase ends with: tests pass, lint clean,
type-check clean, committed, this tracker updated.

The frontend phases mirror the backend's MVP / Differentiation / Scale
groupings so the two repos can ship together. A frontend phase **must not**
ship features that depend on a backend phase that has not yet merged to
`staging`.

### MVP — Launch-blocking phases (must ship before public launch)

- [x] Phase 1 — Scaffold & Design System (commit: `chore: initial scaffold with design system`)
- [x] Phase 2 — Auth (Supabase + role-based middleware) (commit: `feat(auth): add Supabase auth with role-based middleware`)
- [x] Phase 3 — Core Layout & Homepage (commit: `feat(layout): add navbar, footer, and homepage`)
- [ ] Phase 4 — Product Listing & Detail (consumes backend Phase 4)
- [ ] Phase 5 — Cart (matches backend Phase 5 free-shipping threshold)
- [ ] Phase 6 — Stripe Checkout flow (consumes backend Phase 6 + 7)
- [ ] Phase 7 — Account & Order History (consumes backend Phase 8)
- [ ] Phase 8 — Admin Panel + AI description generator (consumes backend Phase 8)
- [ ] Phase 9 — Testing (Vitest + Playwright, 80 % coverage threshold)
- [ ] Phase 10 — CI/CD + Vercel deploy (staging + prod)

🚀 **MVP launch milestone — Phase 10 ships a buyable site.**

### Differentiation — Features that beat Shopify generics

- [ ] Phase 11 — Email-driven UX hooks (resubscribe links, unsubscribe pages, transactional landing pages)
- [ ] Phase 12 — Discount Codes (input field at cart + checkout, percentage / fixed / free-shipping)
- [ ] Phase 13 — Reviews & Ratings (verified-purchase stars on PDP, write-a-review flow)
- [ ] Phase 14 — Wishlist (heart icon on cards, `/account/wishlist`)
- [ ] Phase 15 — Pet Profiles (species, breed, age, weight, dietary needs in `/account/pets`)
- [ ] Phase 16 — Subscribe & Save ⭐ (Stripe Subscriptions cadence selector on PDP, `/account/subscriptions`)
- [ ] Phase 17 — Abandoned Cart Recovery (persist cart to user, deep-link from email)
- [ ] Phase 18 — Back-in-Stock Alerts (notify-me button on out-of-stock PDP)

### Scale — Operations & growth

- [ ] Phase 19 — Product Variants (size / flavor selector; refactors Cart + Checkout)
- [ ] Phase 20 — Bundle / Multi-buy Discounts (badge on cards, auto-applied tier savings in cart)
- [ ] Phase 21 — Admin Dashboard (extended analytics, customer drill-down, fulfilment workflow)
- [ ] Phase 22 — Returns / Refunds (`/account/orders/[id]/return` RMA flow)
- [ ] Phase 23 — Loyalty Points / Store Credit (balance widget, redeem at checkout)
- [ ] Phase 24 — Live Shipping Rates (real-time rate quote at checkout via backend)

---

## Build Phases — Detail

### Phase 1 — Scaffold & Design System
- `pnpm create next-app@latest petsupplies-web --typescript --tailwind --app --src-dir no --import-alias "@/*"`
- Install all dependencies
- Set up `flake.nix` + `.envrc`
- Configure ESLint, Prettier, Husky, lint-staged, commitlint
- Configure `tsconfig.json` (strict)
- Set up Vitest + Playwright configs
- **Implement full design system:**
  - Add Fraunces + DM Sans in `app/layout.tsx`
  - Add all CSS variables to `app/globals.css`
  - Configure `tailwind.config.ts` with brand + warm color scales and font families
  - Create `lib/config/brand.ts`
- Create `.env.local.example`
- Commit: `chore: initial scaffold with design system`

### Phase 2 — Auth
- Configure `@supabase/ssr`
- Create `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- Build root `middleware.ts` — protect `/account/*` and `/admin/*`
  - `/admin/*` checks `user.user_metadata.role === 'ADMIN'`, redirect non-admins to `/`
- Build `/login` and `/signup` — Fraunces heading, DM Sans form, React Hook Form + Zod, Google OAuth
- Build `api/auth/callback/route.ts`
- Commit: `feat(auth): add Supabase auth with role-based middleware`

### Phase 3 — Core Layout & Homepage
- Build `Navbar.tsx`, `MobileMenu.tsx`, `Footer.tsx` using `brand.ts`
- Build `(shop)/layout.tsx`
- Build homepage:
  - Hero: two-column, Fraunces headline with italic em accent, lifestyle photo (next/image), free shipping tag
  - Category strip
  - Featured products grid (server component)
  - Brand values trust bar
- Commit: `feat(layout): add navbar, footer, and homepage`

### Phase 4 — Product Listing & Detail
- Define `types/product.ts` (mirror backend Prisma types — multi-image, category, search facets)
- Create `lib/api/client.ts` — typed fetch wrapper with `NEXT_PUBLIC_API_URL`
- Build `useProducts` hook (React Query)
- Build `ProductCard`, `ProductSkeleton`, `CategoryStrip`, `ProductGrid`
- Build `/products` listing — filter sidebar (category, price, pet type), search box, sort dropdown, pagination
- Build `/products/[slug]` detail — two-column, image gallery, accordion for nutritional info
- Commit: `feat(products): add product listing and detail pages`

### Phase 5 — Cart
- Zustand store `lib/store/cart.ts` with persistence (localStorage for guests)
- Build `CartDrawer`, `CartItem`, `CartSummary`
- Free-shipping progress bar — read threshold from `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD_CENTS`
- Build `/cart` full page (mobile)
- Wire "Add to cart" + badge bounce animation on cart icon
- Commit: `feat(cart): add cart with Zustand and free-shipping progress`

### Phase 6 — Checkout & Stripe
- Create `lib/stripe/client.ts`
- Build `/checkout` — collects shipping address, calls backend `POST /checkout`, redirects to Stripe Checkout
- Build `/checkout/success` — reads `?session_id=`, polls/queries backend for order, clears cart
- Build `/checkout/cancel` — friendly cancel state, returns user to cart
- Commit: `feat(checkout): add Stripe checkout flow`

### Phase 7 — Account
- Build `/account` — order history list (server component, calls backend `/orders`)
- Build `/account/orders/[id]` — order detail (status, tracking, line items, shipping address snapshot)
- Build `/account/addresses` — list + CRUD
- Build `/account/settings` — update name / email
- Commit: `feat(account): add order history, addresses, and settings`

### Phase 8 — Admin Panel
- Build `app/admin/layout.tsx` — sidebar, role guard (middleware already enforces; layout adds bottom-tab nav for mobile)
- Build `app/admin/page.tsx` — dashboard (order count, revenue, low-stock alerts)
- Build `lib/supabase/storage.ts` — upload helper
- Build `ImageUploader.tsx` — drag-and-drop multi-image to Supabase Storage
- Build `AiDescriptionBtn.tsx` — calls backend, streams into textarea
- Build `ProductForm.tsx` — all fields + image uploader + AI button
- Build `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
- Build `/admin/orders` — table + detail drawer with status update + tracking number entry (backend Phase 8 endpoints)
- Commit: `feat(admin): add admin panel with AI description generator`

### Phase 9 — Testing
- Unit tests: `ProductCard`, `CartItem`, `AiDescriptionBtn`, `cart` store, `cn` util
- Playwright e2e: homepage, add to cart, checkout (Stripe test mode), auth, admin role gate
- Hit 80 % coverage threshold (lines / statements / functions); 70 % branches
- Commit: `test: add unit and e2e test coverage`

### Phase 10 — CI/CD & Deploy
- Wire `.github/workflows/ci.yml` (already scaffolded) — lint, typecheck, unit, build, e2e
- Connect repo to Vercel — preview per PR, prod on `main`
- Configure Vercel env vars for **preview** (Supabase staging + `https://petsupplies-api-staging-production.up.railway.app`) and **production** (Supabase prod + Railway prod API)
- Add `staging` long-lived branch tracking the staging Vercel project (matches backend's `staging` branch convention)
- Commit: `ci: add GitHub Actions CI/CD pipeline`

🚀 **MVP launch milestone — Phase 10 ships a buyable site.**

---

### Phase 11 — Email-driven UX hooks
- `/email/unsubscribe` page — token-based one-click unsubscribe (calls backend)
- `/email/preferences` — granular email preference toggles
- Deep-link handlers for transactional emails (order detail, abandoned cart resume, back-in-stock CTA)
- Email-safe shareable order detail page (signed token, no auth required)
- Commit: `feat(email): add unsubscribe and email landing pages`

### Phase 12 — Discount Codes
- Discount code input on `/cart` and `/checkout` — debounced backend validation
- Display savings line in `CartSummary` and Stripe Checkout
- Auto-apply free-shipping codes (suppress threshold progress bar when active)
- Show backend error messages (expired, min-spend, ineligible)
- Commit: `feat(discounts): coupon input on cart and checkout`

### Phase 13 — Reviews & Ratings
- Star-rating chip on `ProductCard` (avg + count)
- Review list + write-review form on PDP (verified-purchase only)
- `useReviews` hook (paginated, sort by helpful / recent)
- `/account/orders/[id]` → "Leave a review" CTA per delivered line item
- Commit: `feat(reviews): add product reviews and ratings`

### Phase 14 — Wishlist
- Heart icon on `ProductCard` + PDP — optimistic toggle, requires auth
- `/account/wishlist` page — grid + "Move to cart"
- Wishlist count badge in nav
- Commit: `feat(wishlist): add wishlist with optimistic updates`

### Phase 15 — Pet Profiles
- `/account/pets` — list + add / edit / delete
- `PetProfileForm` — species (Dog / Cat / Bird / Small Animal), breed, birthday, weight, dietary needs (multiselect)
- Pet-aware product recommendations on homepage when signed in
- "For your pets" filter chip on `/products`
- Commit: `feat(pets): add pet profiles with personalised recommendations`

### Phase 16 — Subscribe & Save ⭐
- Subscribe-vs-one-time toggle on PDP with cadence selector (4 / 6 / 8 weeks) and discount badge
- `/account/subscriptions` — list, pause, skip-next, change cadence, cancel
- Subscription status pill in `/account` nav
- Checkout flow handles mixed subscription + one-time carts (backend creates Stripe Subscription)
- Commit: `feat(subscriptions): add subscribe and save with cadence management`

### Phase 17 — Abandoned Cart Recovery
- Persist guest cart to backend on first sign-in (cart merge)
- Persist signed-in cart server-side (existing Zustand store gains hydrate-from-server)
- `/cart?recover=<token>` — backend resolves token to a previously-abandoned cart
- Deep-link from recovery email lands signed-in users straight on `/checkout`
- Commit: `feat(cart): add server-side cart persistence and recovery deep-link`

### Phase 18 — Back-in-Stock Alerts
- "Notify me when back in stock" button on out-of-stock PDPs
- `/account/notifications` — manage active alerts
- Email deep-link handler resolves to PDP with stock confirmed
- Commit: `feat(notifications): add back-in-stock alert subscriptions`

---

### Phase 19 — Product Variants
- Refactor `types/product.ts` — `ProductVariant` (size / flavor / weight)
- Variant selector on `ProductCard` (compact) and PDP (full radio group)
- Refactor `cart` store — line key becomes `variantId` not `productId`
- Refactor `CheckoutForm`, order detail rendering
- Commit: `feat(variants): add product variants across cart and checkout`

### Phase 20 — Bundle / Multi-buy Discounts
- Bundle badge on `ProductCard` ("Buy 2, save 10%")
- Tier-savings banner in `CartSummary` ("Add 1 more to save $5")
- `/products?bundle=...` filter
- Commit: `feat(bundles): add bundle discount UI`

### Phase 21 — Admin Dashboard (extended)
- Charts: revenue over time, top products, low-stock heatmap (Recharts)
- Customer drill-down: `/admin/customers/[id]` — orders, LTV, subscriptions
- Fulfilment workflow: bulk-mark-shipped + tracking CSV upload
- Commit: `feat(admin): extend dashboard with analytics and fulfilment`

### Phase 22 — Returns / Refunds
- `/account/orders/[id]/return` — multi-step RMA flow (select items, reason, photo upload)
- `/admin/returns` — review queue, approve/reject/refund
- Status pill on order detail when return is in progress
- Commit: `feat(returns): add RMA flow for customers and admin`

### Phase 23 — Loyalty Points / Store Credit
- Balance widget in nav for signed-in users
- "Redeem points" toggle in `CartSummary` and `/checkout`
- `/account/rewards` — earnings history + tier status
- Commit: `feat(loyalty): add points balance and redemption`

### Phase 24 — Live Shipping Rates
- Replace flat-rate logic at `/checkout` — call backend for live rates after address entry
- Carrier + service-level selector (Standard / Expedited / Overnight)
- Show estimated delivery date per option
- Commit: `feat(shipping): add live shipping rates at checkout`

---

## Staging vs Production
- **Staging**: Vercel preview per PR → Railway staging API + Supabase staging project
- **Production**: Vercel production on merge to `main` → Railway prod API + Supabase prod project

---

## Notes for Claude Code Agents
- **Brand name is a placeholder.** Everything lives in `lib/config/brand.ts`. Never hardcode "pawsupply" anywhere else.
- **Design system is non-negotiable.** Every component must use `brand-*` and `warm-*` Tailwind tokens and Fraunces/DM Sans font variables. Never use default Tailwind grays or generic sans-serif.
- **Mobile first.** Write Tailwind classes mobile-first.
- **One phase at a time.** Commit after each phase before starting the next.
- **Use Sonnet for implementation.** Use Opus only for auth middleware, RLS, or complex bugs.
- **Admin route group** always checks both authentication AND `role === 'ADMIN'`.
- **Image uploads** go to Supabase Storage. Only the resulting public URL is stored in Postgres.
- **AI description generation** is server-side only. Frontend calls `petsupplies-api`, which calls Anthropic. API key never touches the frontend.
- **Hero image**: use `public/images/hero-placeholder.jpg` until the real pet photo is provided. The image slot should be easy to swap — one file replacement, no code changes needed.

---

## Per-phase notes (deviations from plan, surprises, follow-ups)

### Phase 1 — Scaffold & Design System
- Kept legacy `.eslintrc.json` + `.eslintignore` rather than ESLint 9 flat
  config — `eslint-config-next` 14 still ships its presets in the legacy
  format, and `next lint` resolves them transparently. Revisit when
  bumping to Next 15 / ESLint 9.
- `tsconfig.json` enables `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, and `useUnknownInCatchVariables`. Every file
  authored later must work under these — `process.env.X` always returns
  `string | undefined`, so use `!` non-null after a top-level guard.
- Font axes: Fraunces is loaded with `style: ['normal', 'italic']` and
  `axes: ['SOFT', 'WONK']`. Don't add weight axes — `next/font` complains
  if `weight` is combined with variable axes.
- `lucide-react` resolves to v1.x in this repo (peer-of-React selection
  quirk in pnpm). Icon names + size prop API are unchanged for the icons
  we use, but if v2 is needed later, audit imports.

### Phase 2 — Auth
- **`getUser()` not `getSession()`** in middleware. Supabase docs are
  explicit: `getSession` returns the cookie payload without verification
  and is unsafe server-side. `getUser` round-trips to Supabase Auth so
  the JWT is validated.
- **Cookie copy on redirect.** `NextResponse.redirect()` does **not**
  inherit cookies set on the previous `NextResponse.next()`. We
  explicitly `response.cookies.getAll().forEach(set on redirect)`,
  otherwise the user appears signed out on the next request and the
  middleware enters a redirect loop.
- **Server Component cookie writes.** `createServerClient` for `app/`
  server components wraps `cookieStore.set` in `try/catch` because RSC
  render contexts throw if you mutate cookies. Cookies are actually
  written by the middleware path and the OAuth callback route — server
  components only ever *read*.
- **PKCE flow + matcher.** `@supabase/ssr` defaults to PKCE. The
  `code_verifier` cookie is set by `signInWithOAuth` in the browser and
  read by the callback route during `exchangeCodeForSession`. Middleware
  matcher **must** exclude `/api/auth/callback` so we don't run
  `getUser()` and reshuffle cookies before the exchange runs.
- **`?next=` open-redirect guard.** The callback route validates that
  `next` starts with `/`. Without this, an attacker could craft an OAuth
  link that lands users on `https://evil.com/...`.
- **Already-signed-in users on `/login` or `/signup`.** Server-component
  pages call `getUser()` and `redirect()` to `/account` (or
  `?redirect=` target). Avoids a confusing logged-in-on-login-page
  state. The `<Suspense>` boundary inside the page is required because
  `LoginForm` / `SignupForm` use `useSearchParams`, and without
  `<Suspense>` Next 14 errors during `pnpm build` static generation.
- **Email confirmation flow.** Supabase staging defaults to requiring
  email confirmation, so `signUp` returns `{ user, session: null }`
  rather than a session. `SignupForm` detects this and shows a "Check
  your email" panel. Pass `emailRedirectTo` so the confirmation link
  lands on our callback route.
- **`router.refresh()` after sign-in / sign-out.** Required so RSC tree
  and middleware re-evaluate with the new cookie state without a hard
  reload. The `useAuth` hook fires `refresh()` only on `SIGNED_IN` and
  `SIGNED_OUT` events, not on every `TOKEN_REFRESHED` (would cause
  unnecessary churn).
- **`user_metadata.role` is user-mutable.** The plan specifies
  `user_metadata.role`, so we follow it. A `TODO(security)` comment
  marks the middleware line; harden to `app_metadata.role` once the
  backend Phase 8 admin endpoint can set it server-side.
- **Supabase Dashboard one-time setup** (out of code, documented in PR
  body): add `http://localhost:3000/api/auth/callback`,
  `https://<vercel-preview>/api/auth/callback`, and
  `https://<prod-domain>/api/auth/callback` to **Authentication → URL
  Configuration → Redirect URLs**, and enable **Authentication →
  Providers → Google** with client ID + secret.
- **Anon key in `.env.local`.** `NEXT_PUBLIC_SUPABASE_URL` is filled
  with the staging URL; `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally
  blank in this commit — implementer must paste the key locally and add
  it as a GitHub Actions secret + Vercel env var before Phase 10.
- All five gates passed locally on the Phase 2 commit:
  `pnpm type-check`, `pnpm lint` (0 warnings), husky pre-commit (lint-
  staged ran `eslint --fix` + `prettier --write` on 18 files),
  commitlint accepted the conventional message.

### Phase 3 — Core Layout & Homepage
- **Old `app/page.tsx` deleted, replaced by `app/(shop)/page.tsx`.**
  Next.js route groups co-locate at `/`, so the shop layout
  (`(shop)/layout.tsx` with `<Navbar />` + `<Footer />`) wraps the
  homepage automatically. The pre-existing `app/(auth)/layout.tsx`
  continues to wrap `/login` and `/signup` without conflict because
  route groups don't collide on segment paths.
- **Sticky-shadow + mobile-menu state lives in `<NavbarShell />`**, a
  small `'use client'` wrapper. `<Navbar />` itself stays a server
  component and just composes the shell with `NavLinks`, `CartIcon`,
  and `AuthSlot` islands — keeping the client bundle lean.
- **Active nav links derive from `usePathname()`.** `NAV_LINKS` for
  pet categories use querystring hrefs (e.g. `/products?pet=dog`),
  so the matcher compares the path portion only. `aria-current="page"`
  is set whenever the path matches.
- **Cart icon is `'use client'` even though count is hard-coded 0.**
  The component accepts `count` via prop today; in Phase 5 the parent
  flips to `useCart()` from Zustand without changing this component.
  Putting the client boundary here now means we don't churn the
  Navbar tree later.
- **`brand.social.*` is `as const` empty string.** That literal type
  narrows truthy branches to `never`, which broke the type-predicate
  filter approach. Footer now coerces to `string` once and pushes
  conditionally into a typed `SocialLink[]`. Whenever Phase 11+ wires
  real handles, just set `brand.social.instagram = '...'` — Footer
  will render the icon link automatically.
- **Hero `<Image>` uses `placeholder="blur"` with an inline 1×1
  warm-100 JPEG `blurDataURL`.** The slot has `bg-warm-100` so even
  if `public/images/hero-placeholder.jpg` is missing the layout still
  paints in brand colors. `next/image` reads files from `public/` at
  request-time, not build-time, so `pnpm build` succeeds without the
  asset. A `public/images/README.md` documents the expected file
  spec (1600×1200, 4:3, real lifestyle photo) for the single-file
  swap when the photo lands.
- **Italic accent on the Hero `<h1>` is computed from `brand.tagline`.**
  Last word + terminator is split off and wrapped in
  `<em className="italic text-brand-400">`, so renaming the brand or
  changing the tagline keeps the visual treatment without code edits.
- **MobileMenu focus trap is hand-rolled** (no extra dep). `useEffect`
  registers a `keydown` listener that wraps Tab between the first and
  last focusable elements inside the panel, plus closes on `Escape`.
  Scroll-lock toggles `document.body.style.overflow = 'hidden'` and
  restores the previous value on unmount, so navigating mid-open via
  the auth slot can't leave the page locked.
- **Closing the mobile menu returns focus to the hamburger button.**
  `<NavbarShell />` keeps a ref on the trigger and re-focuses it after
  any close (backdrop, ESC, link tap, or X button). Standard a11y
  expectation for dialog-style overlays.
- **`AuthSlot` shows a sized placeholder while `useAuth` loads.**
  Prevents the navbar from shifting between "Sign in" → initial chip
  on first hydration. The signed-in dropdown closes on click-outside
  (mousedown listener), ESC, and selecting either menu item. The
  dropdown is also rendered inside `MobileMenu`'s footer so signed-out
  mobile users have a sign-in entry point.
- **`lucide-react` is v1.x** (per Phase 1's note). All icons used
  (`Menu`, `X`, `Search`, `ShoppingBag`, `Truck`, `Stethoscope`,
  `Undo2`, `LucideIcon` type) exist and accept the same `size` prop
  used elsewhere in the auth components.
- **`formatPrice(cents, currency)` lives in `lib/utils/format.ts`**
  rather than `lib/utils.ts` to keep `cn` colocation tidy. Phase 4
  will reuse this from the product detail page and Phase 5 from the
  cart summary. Defaults to USD until backend Phase 6 introduces
  multi-currency.
- **Stale `.next/types` cache surfaced after deleting `app/page.tsx`.**
  Removed `.next/` once before re-running `pnpm type-check`. Worth
  remembering for future page-route deletions — Next 14 doesn't
  invalidate the typed-routes manifest on file removal.
- **All gates green** locally before commit: `pnpm type-check`,
  `pnpm lint` (0 warnings), `pnpm format:check`, `pnpm build` (9
  static + dynamic routes, homepage prerendered, 5.84 kB / 102 kB
  first-load JS).
