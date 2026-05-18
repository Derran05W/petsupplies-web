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
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-warm-400"
        aria-hidden
      />
      <input
        id="admin-customer-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by email or name"
        className="w-full rounded-lg border border-warm-300 bg-white py-2.5 pl-10 pr-3 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400 md:max-w-md"
      />
    </div>
  );
}
