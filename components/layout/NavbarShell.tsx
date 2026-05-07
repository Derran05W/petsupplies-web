'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Menu, Search } from 'lucide-react';
import { brand } from '@/lib/config/brand';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';

interface NavbarShellProps {
  /** Desktop nav-link cluster (NavLinks). */
  links: ReactNode;
  /** Always-visible cart icon island. */
  cart: ReactNode;
  /** Auth state slot (Sign in link or account chip). */
  auth: ReactNode;
}

export function NavbarShell({ links, cart, auth }: NavbarShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

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

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-warm-50/90 backdrop-blur-sm transition-shadow',
          scrolled ? 'border-b border-warm-200 shadow-sm' : '',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 md:px-8 lg:px-12">
          <Link
            href="/"
            aria-label={brand.name}
            className="inline-flex items-baseline gap-0.5 font-body text-lg font-medium text-warm-900"
          >
            <span className="text-brand-600">{brand.name.slice(0, 3)}</span>
            <span>{brand.name.slice(3)}</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden lg:flex lg:flex-1 lg:justify-center"
          >
            {links}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className="hidden size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100 lg:inline-flex"
            >
              <Search size={18} aria-hidden />
            </button>
            {cart}
            <div className="hidden lg:block">{auth}</div>
            <button
              ref={hamburgerRef}
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-lg text-warm-900 transition-colors hover:bg-warm-100 lg:hidden"
            >
              <Menu size={18} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={closeMobile} />
    </>
  );
}
