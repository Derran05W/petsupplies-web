import type {
  EmailMarketingPreferences,
  EmailPreferencesResponse,
} from '@/types/email';
import { apiFetch } from './client';

/**
 * Email preference / unsubscribe API — token-authenticated (no session).
 *
 * BACKEND GAP: none of these routes exist yet — no `email` router is mounted
 * in `petsupplies-api` `src/app.ts` and there is no `src/routes/email.ts`.
 * Every call therefore 404s. The callers ([UnsubscribeEmailClient],
 * [PreferencesEmailClient]) already branch on the resulting `ApiError`
 * (`isNetworkError` vs. `message`) and render a friendly error panel instead
 * of crashing or spinning forever, so the surface degrades gracefully until
 * the backend ships these routes. See `backendGaps` in the workflow.
 */
export async function postEmailUnsubscribe(token: string): Promise<void> {
  await apiFetch<void>('/email/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function getEmailPreferences(
  token: string,
): Promise<EmailPreferencesResponse> {
  const params = new URLSearchParams({ token });
  return apiFetch<EmailPreferencesResponse>(
    `/email/preferences?${params.toString()}`,
    { cache: 'no-store' },
  );
}

export async function patchEmailPreferences(
  token: string,
  preferences: EmailMarketingPreferences,
): Promise<void> {
  const params = new URLSearchParams({ token });
  await apiFetch<void>(`/email/preferences?${params.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify({ preferences }),
  });
}
