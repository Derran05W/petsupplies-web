/**
 * Stored under Supabase `user.user_metadata.notification_prefs`.
 * Booleans default to true for transactional categories when absent.
 */
export interface NotificationPrefs {
  marketing?: boolean;
  orderUpdates?: boolean;
  backInStock?: boolean;
  subscriptionReminders?: boolean;
}

export function parseNotificationPrefs(
  meta: Record<string, unknown> | null | undefined,
): NotificationPrefs {
  const raw = meta?.['notification_prefs'];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const bool = (k: string): boolean | undefined => {
    const v = o[k];
    if (typeof v === 'boolean') return v;
    return undefined;
  };
  return {
    marketing: bool('marketing'),
    orderUpdates: bool('orderUpdates'),
    backInStock: bool('backInStock'),
    subscriptionReminders: bool('subscriptionReminders'),
  };
}

export function defaultNotificationPrefs(): Required<NotificationPrefs> {
  return {
    marketing: true,
    orderUpdates: true,
    backInStock: true,
    subscriptionReminders: true,
  };
}

export function mergeNotificationPrefs(
  prefs: NotificationPrefs,
): Required<NotificationPrefs> {
  const d = defaultNotificationPrefs();
  return {
    marketing: prefs.marketing ?? d.marketing,
    orderUpdates: prefs.orderUpdates ?? d.orderUpdates,
    backInStock: prefs.backInStock ?? d.backInStock,
    subscriptionReminders:
      prefs.subscriptionReminders ?? d.subscriptionReminders,
  };
}
