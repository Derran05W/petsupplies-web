'use client';

import { createContext, useContext } from 'react';
import type { RewardTier } from '@/types/site';

/**
 * SSR-seeded gift-reward tiers, sorted ascending by threshold. Empty array
 * means the feature is off — the storefront renders nothing. Mirrors
 * `FreeShippingThresholdProvider`: the value is read once on the server (from
 * `GET /site/settings`) and passed down so product pages and the cart can show
 * the rewards progress bar without an authenticated request.
 */
const RewardTiersContext = createContext<RewardTier[]>([]);

interface RewardTiersProviderProps {
  tiers: RewardTier[];
  children: React.ReactNode;
}

export function RewardTiersProvider({
  tiers,
  children,
}: RewardTiersProviderProps) {
  return (
    <RewardTiersContext.Provider value={tiers}>
      {children}
    </RewardTiersContext.Provider>
  );
}

export function useRewardTiers(): RewardTier[] {
  return useContext(RewardTiersContext);
}
