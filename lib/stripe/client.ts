/**
 * Stripe publishable-key accessor.
 *
 * Phase 6 uses **hosted** Stripe Checkout — the backend creates the
 * session, returns `{ url, sessionId }`, and the frontend redirects via
 * `window.location.href = url`. We therefore do NOT load `@stripe/stripe-js`
 * on `/checkout` at all; this file only exists so future phases that
 * actually mount Stripe Elements (saved cards, Embedded Checkout for
 * Phase 16's Subscribe & Save cadence picker) have a single home for the
 * lazy `loadStripe` import.
 *
 * When that day comes, the typical pattern is:
 *
 *   import { loadStripe, type Stripe } from '@stripe/stripe-js';
 *   let stripePromise: Promise<Stripe | null> | null = null;
 *   export function getStripe(): Promise<Stripe | null> {
 *     if (!stripePromise) {
 *       stripePromise = loadStripe(getStripePublishableKey());
 *     }
 *     return stripePromise;
 *   }
 *
 * Lazy-cached at the module scope so the script tag is only injected the
 * first time something asks for it.
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key || key.length === 0) {
    return '';
  }
  return key;
}
