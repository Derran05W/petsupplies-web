'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useStorefrontBrand } from '@/components/providers/StorefrontBrandProvider';
import { useFreeShippingThresholdCents } from '@/components/providers/FreeShippingThresholdProvider';
import { formatFreeShippingLabel } from '@/lib/site/shipping-copy';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  NAV_BAR_CLASSES,
  NAV_LINK_CLASSES,
  WORDMARK_CLASSES,
  TopBar,
} from '@/components/ui';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartLiveRegion } from '@/components/cart/CartLiveRegion';
import { CartIcon } from './CartIcon';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';
import { AuthSlot } from './AuthSlot';
import { SettingsButton } from './SettingsButton';
import { SettingsDrawer } from './SettingsDrawer';
import { SettingsDrawerContext } from './SettingsDrawerContext';
import { SearchOverlay } from './SearchOverlay';

/**
 * Boutique site header: ink announcement TopBar (free-shipping offer)
 * over the sticky blur nav — admin links left, italic wordmark center,
 * uppercase Search / Cart (n) / Account triggers right. Owns:
 *   - mobile menu open / close + focus return to the menu trigger
 *   - cart drawer open / close + focus return to the cart trigger
 *   - settings drawer open / close + focus return to the settings trigger
 *   - search overlay open / close + focus return to the search trigger
 *   - the always-mounted CartLiveRegion (so add / remove announcements
 *     work from any shop page surface)
 *
 * Stays a client component because of all the local UI state.
 */
export function NavbarShell() {
  const brand = useStorefrontBrand();
  const thresholdCents = useFreeShippingThresholdCents();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);

  const openSettings = useCallback(() => {
    setDrawerOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    setSettingsOpen(true);
  }, []);

  const settingsDrawerContextValue = useMemo(
    () => ({ openSettings }),
    [openSettings],
  );

  function closeMobile() {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }

  function closeCartDrawer() {
    setDrawerOpen(false);
    cartButtonRef.current?.focus();
  }

  function closeSettingsDrawer() {
    setSettingsOpen(false);
    settingsButtonRef.current?.focus();
  }

  function openCartDrawer() {
    setSettingsOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    setDrawerOpen(true);
  }

  function openMobileMenu() {
    setSettingsOpen(false);
    setDrawerOpen(false);
    setSearchOpen(false);
    setMobileOpen(true);
  }

  function openSearch() {
    setSettingsOpen(false);
    setDrawerOpen(false);
    setMobileOpen(false);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    searchButtonRef.current?.focus();
  }

  return (
    <SettingsDrawerContext.Provider value={settingsDrawerContextValue}>
      <>
        <TopBar>{formatFreeShippingLabel(thresholdCents)}</TopBar>
        <header className={cn('sticky top-0 z-40', NAV_BAR_CLASSES)}>
          <nav aria-label="Primary" className="hidden md:block">
            <NavLinks />
          </nav>

          <Link
            href="/"
            aria-label={brand.name}
            className={cn(
              WORDMARK_CLASSES,
              'justify-self-start whitespace-nowrap text-xl sm:text-2xl md:justify-self-center',
            )}
          >
            {brand.name}
          </Link>

          <div className="flex items-center justify-end gap-4 font-body text-label uppercase text-ink sm:gap-7">
            <button
              ref={searchButtonRef}
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={openSearch}
              className={cn(NAV_LINK_CLASSES, 'uppercase')}
            >
              Search
            </button>
            <CartIcon ref={cartButtonRef} onOpenDrawer={openCartDrawer} />
            {loading ? (
              <span
                aria-hidden
                className="hidden h-4 w-16 rounded bg-panel md:block"
              />
            ) : user ? (
              <SettingsButton ref={settingsButtonRef} onOpen={openSettings} />
            ) : (
              <AuthSlot className="hidden md:block" />
            )}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={openMobileMenu}
              className={cn(NAV_LINK_CLASSES, 'uppercase md:hidden')}
            >
              Menu
            </button>
          </div>
        </header>

        <MobileMenu
          open={mobileOpen}
          onClose={closeMobile}
          onOpenSearch={openSearch}
        />
        <SearchOverlay open={searchOpen} onClose={closeSearch} />
        <CartDrawer open={drawerOpen} onClose={closeCartDrawer} />
        <SettingsDrawer open={settingsOpen} onClose={closeSettingsDrawer} />
        <CartLiveRegion />
      </>
    </SettingsDrawerContext.Provider>
  );
}
