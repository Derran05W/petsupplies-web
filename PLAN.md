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

## Build Phases

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
- Create `lib/supabase/client.ts`, `server.ts`
- Build `middleware.ts` — protect `/account/*` and `/admin/*`
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
- Define `types/product.ts`
- Create `lib/api/client.ts`
- Build `useProducts` hook
- Build `ProductCard`, `ProductSkeleton`, `CategoryStrip`, `ProductGrid`
- Build `/products` listing with filter sidebar
- Build `/products/[slug]` detail — two-column, accordion for nutritional info
- Commit: `feat(products): add product listing and detail pages`

### Phase 5 — Cart
- Zustand store `lib/store/cart.ts`
- Build `CartDrawer`, `CartItem`, `CartSummary`
- Build `/cart` full page (mobile)
- Wire "Add to cart" + badge animation on cart icon
- Commit: `feat(cart): add cart with Zustand`

### Phase 6 — Checkout & Stripe
- Create `lib/stripe/client.ts`
- Build `/checkout` → calls API → redirects to Stripe
- Build `/checkout/success`
- Commit: `feat(checkout): add Stripe checkout flow`

### Phase 7 — Account
- Build `/account` — order history
- Build `/account/settings` — update name/email
- Commit: `feat(account): add order history and settings`

### Phase 8 — Admin Panel
- Build `app/admin/layout.tsx` — sidebar, role guard
- Build `app/admin/page.tsx` — dashboard (order count, revenue, low stock alerts)
- Build `lib/supabase/storage.ts` — upload helper
- Build `ImageUploader.tsx` — drag-and-drop to Supabase Storage
- Build `AiDescriptionBtn.tsx` — calls API, streams into textarea
- Build `ProductForm.tsx` — all fields + image uploader + AI button
- Build `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`
- Build `/admin/orders` — full table, click-to-expand detail
- Commit: `feat(admin): add admin panel with AI description generator`

### Phase 9 — Testing
- Unit tests: `ProductCard`, `CartItem`, `AiDescriptionBtn`, utils
- Playwright e2e: homepage, add to cart, checkout (Stripe test mode), auth
- Commit: `test: add unit and e2e test coverage`

### Phase 10 — CI/CD & Deploy
- Add `.github/workflows/ci.yml`
- Connect repo to Vercel
- Set environment variables for preview and production
- Commit: `ci: add GitHub Actions CI/CD pipeline`

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
