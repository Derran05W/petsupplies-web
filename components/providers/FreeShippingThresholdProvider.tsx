'use client';

import { createContext, useContext } from 'react';
import { getFreeShippingThresholdCentsSync } from '@/lib/config/shipping-env';

const FreeShippingThresholdContext = createContext<number>(
  getFreeShippingThresholdCentsSync(),
);

interface FreeShippingThresholdProviderProps {
  thresholdCents: number;
  children: React.ReactNode;
}

export function FreeShippingThresholdProvider({
  thresholdCents,
  children,
}: FreeShippingThresholdProviderProps) {
  return (
    <FreeShippingThresholdContext.Provider value={thresholdCents}>
      {children}
    </FreeShippingThresholdContext.Provider>
  );
}

export function useFreeShippingThresholdCents(): number {
  return useContext(FreeShippingThresholdContext);
}
