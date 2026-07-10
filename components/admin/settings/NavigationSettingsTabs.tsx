'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FooterNavEditor } from './FooterNavEditor';
import { HeaderNavEditor } from './HeaderNavEditor';

type NavTab = 'header' | 'footer';

export function NavigationSettingsTabs() {
  const [tab, setTab] = useState<NavTab>('header');

  return (
    <>
      <div
        role="tablist"
        aria-label="Navigation sections"
        className="mb-6 flex gap-2 border-b border-line pb-4"
      >
        {(
          [
            { id: 'header' as const, label: 'Header' },
            { id: 'footer' as const, label: 'Footer' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-pill px-4 py-2 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
              tab === item.id
                ? 'bg-ink text-paper'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'header' ? <HeaderNavEditor /> : <FooterNavEditor />}
      </div>
    </>
  );
}
