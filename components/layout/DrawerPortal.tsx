'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerPortalProps {
  children: React.ReactNode;
}

/**
 * Renders slide-over drawers on `document.body` so `fixed` positioning and
 * theme backgrounds are not clipped or blended with the navbar stack.
 */
export function DrawerPortal({ children }: DrawerPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
