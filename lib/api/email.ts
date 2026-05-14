import type {
  EmailMarketingPreferences,
  EmailPreferencesResponse,
} from '@/types/types/email';
import { apiFetch } from './client';

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
