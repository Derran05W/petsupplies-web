export interface EmailMarketingPreferences {
  promotional: boolean;
  abandonedCart: boolean;
  backInStock: boolean;
  orderUpdates: boolean;
}

export interface EmailPreferencesResponse {
  preferences: EmailMarketingPreferences;
}
