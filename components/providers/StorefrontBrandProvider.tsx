'use client';

import { createContext, useContext } from 'react';
import { brand, type Brand } from '@/lib/config/brand';

const StorefrontBrandContext = createContext<Brand>(brand);

interface StorefrontBrandProviderProps {
  brand: Brand;
  children: React.ReactNode;
}

export function StorefrontBrandProvider({
  brand: value,
  children,
}: StorefrontBrandProviderProps) {
  return (
    <StorefrontBrandContext.Provider value={value}>
      {children}
    </StorefrontBrandContext.Provider>
  );
}

export function useStorefrontBrand(): Brand {
  return useContext(StorefrontBrandContext);
}
