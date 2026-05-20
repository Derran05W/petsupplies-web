'use client';

import { createContext, useContext } from 'react';
import { HEADER_NAV_FALLBACK } from '@/lib/site/nav-fallbacks';
import type { NavLink } from '@/types/site';

const StorefrontNavContext = createContext<NavLink[]>(HEADER_NAV_FALLBACK);

interface StorefrontNavProviderProps {
  headerLinks: NavLink[];
  children: React.ReactNode;
}

export function StorefrontNavProvider({
  headerLinks,
  children,
}: StorefrontNavProviderProps) {
  return (
    <StorefrontNavContext.Provider value={headerLinks}>
      {children}
    </StorefrontNavContext.Provider>
  );
}

export function useStorefrontHeaderNav(): NavLink[] {
  return useContext(StorefrontNavContext);
}
