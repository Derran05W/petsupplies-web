'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface CustomerSearchFieldProps {
  defaultSearch: string;
}

/**
 * Debounced search — URL `?search=` is source of truth; list RSC drops `page` when search changes.
 */
export function CustomerSearchField({
  defaultSearch,
}: CustomerSearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultSearch);

  useEffect(() => {
    setValue(defaultSearch);
  }, [defaultSearch]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const q = value.trim();
      const params = new URLSearchParams();
      if (q.length > 0) params.set('search', q);
      const qs = params.toString();
      router.replace(qs.length > 0 ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(handle);
  }, [value, pathname, router]);

  return (
    <div className="relative">
      <label htmlFor="admin-customer-search" className="sr-only">
        Search customers
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
      <input
        id="admin-customer-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by email or name"
        className="w-full rounded-tile border border-line bg-paper py-2.5 pl-10 pr-3 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none md:max-w-md"
      />
    </div>
  );
}
