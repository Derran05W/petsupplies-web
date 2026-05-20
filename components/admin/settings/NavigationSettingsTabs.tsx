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
        className="mb-6 flex gap-2 border-b border-warm-200 pb-4"
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
              'rounded-lg px-4 py-2 font-body text-sm transition-colors',
              tab === item.id
                ? 'bg-brand-50 font-medium text-brand-700'
                : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900',
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
