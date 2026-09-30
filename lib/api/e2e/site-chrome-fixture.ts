/**
 * Playwright-only SSR site chrome (settings/nav/category strip/featured) —
 * never enable outside controlled e2e runs.
 *
 * The chrome fetchers normally reach the live API and only fall back to the
 * static defaults on ApiError. Under e2e that makes specs depend on whatever
 * a local API — or a stale `.next/cache/fetch-cache` entry from a previous
 * build — last answered. This flag short-circuits the fetchers to their
 * fallbacks before any network or data-cache read, so specs always see the
 * same chrome CI sees.
 */
export function isE2eSiteChromeFixtureEnabled(): boolean {
  return process.env.E2E_SITE_CHROME_FIXTURE === '1';
}
