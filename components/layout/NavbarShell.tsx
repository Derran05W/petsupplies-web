'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartLiveRegion } from '@/components/cart/CartLiveRegion';
import { CartIcon } from './CartIcon';
import { MobileMenu } from './MobileMenu';
import { NavLinks } from './NavLinks';
import { AuthSlot } from './AuthSlot';
import { SettingsButton } from './SettingsButton';
import { SettingsDrawer } from './SettingsDrawer';
import { SettingsDrawerContext } from './SettingsDrawerContext';

/**
 * Top-level navbar wrapper. Owns:
 *   - sticky-shadow scroll state
 *   - mobile menu open / close + focus return to hamburger
 *   - cart drawer open / close + focus return to cart icon
 *   - settings drawer open / close + focus return to settings trigger
 *   - the always-mounted CartLiveRegion (so add / remove announcements
 *     work from any shop page surface)
 *
 * Stays a client component because of all the local UI state.
 */
export function NavbarShell() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const cartIconRef = useRef<HTMLButtonElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const openSettings = useCallback(() => {
    setDrawerOpen(false);
    setMobileOpen(false);
    setSettingsOpen(true);
  }, []);

  const settingsDrawerContextValue = useMemo(
    () => ({ openSettings }),
    [openSettings],
  );

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function closeMobile() {
    setMobileOpen(false);
    hamburgerRef.current?.focus();
  }

  function closeCartDrawer() {
    setDrawerOpen(false);
    cartIconRef.current?.focus();
  }

  function closeSettingsDrawer() {
    setSettingsOpen(false);
    settingsButtonRef.current?.focus();
  }

  function openCartDrawer() {
    setSettingsOpen(false);
    setMobileOpen(false);
    setDrawerOpen(true);
  }

  function openMobileMenu() {
    setSettingsOpen(false);
    setDrawerOpen(false);
    setMobileOpen(true);
  }

  return (
    <SettingsDrawerContext.Provider value={settingsDrawerContextValue}>
      <>
        <header
          className={cn(
            'bg-warm-50/90 sticky top-0 z-40 backdrop-blur-sm transition-shadow',
            scrolled ? 'border-b border-warm-200 shadow-sm' : '',
          )}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 md:px-8 lg:px-12">
            <Link
              href="/"
              aria-label={brand.name}
              className="inline-flex items-baseline gap-1 font-body text-lg font-medium text-warm-900"
            >
              {(() => {
                const words = brand.name.split(' ');
                const n = brand.logoAccentWords ?? 1;
                const accent = words.slice(0, n).join(' ');
                const rest = words.slice(n).join(' ');
                return (
                  <>
                    <span className="text-brand-600">{accent}</span>
                    {rest && <span>{rest}</span>}
                  </>
                );
              })()}
            </Link>

            <nav
              aria-label="Primary"
              className="hidden lg:flex lg:flex-1 lg:justify-center"
            >
              <NavLinks />
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                aria-label="Search"
                className="hidden size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100 lg:inline-flex"
              >
                <Search size={18} aria-hidden />
              </button>
              <CartIcon ref={cartIconRef} onOpenDrawer={openCartDrawer} />
              {loading ? (
                <div aria-hidden className="size-9 rounded-lg bg-warm-100" />
              ) : user ? (
                <SettingsButton ref={settingsButtonRef} onOpen={openSettings} />
              ) : (
                <div className="hidden lg:block">
                  <AuthSlot />
                </div>
              )}
              <button
                ref={hamburgerRef}
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={openMobileMenu}
                className="inline-flex size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100 lg:hidden"
              >
                <Menu size={18} aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <MobileMenu open={mobileOpen} onClose={closeMobile} />
        <CartDrawer open={drawerOpen} onClose={closeCartDrawer} />
        <SettingsDrawer open={settingsOpen} onClose={closeSettingsDrawer} />
        <CartLiveRegion />
      </>
    </SettingsDrawerContext.Provider>
  );
}
