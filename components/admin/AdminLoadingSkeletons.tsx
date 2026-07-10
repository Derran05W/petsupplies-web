import { Loader2 } from 'lucide-react';

export function AdminBannerPlaceholder() {
  return (
    <div
      className="mb-6 inline-flex h-8 w-24 animate-pulse rounded-card bg-panel"
      aria-hidden
    />
  );
}

export function AdminPageHeaderSkeleton({
  withAction = false,
}: {
  withAction?: boolean;
}) {
  return (
    <header
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      aria-hidden
    >
      <div className="flex flex-col gap-2">
        <div className="h-9 w-48 animate-pulse rounded bg-panel md:w-64" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-panel" />
      </div>
      {withAction && (
        <div className="h-10 w-36 shrink-0 animate-pulse rounded-pill bg-panel" />
      )}
    </header>
  );
}

interface AdminTableSkeletonProps {
  caption: string;
  columns: string[];
  rows?: number;
  /** Hide columns on small breakpoints (index matches columns). */
  hiddenFromSm?: number[];
  hiddenFromMd?: number[];
}

/**
 * Table chrome with pulse rows — use as a Suspense fallback so list
 * pages feel instant while data streams in.
 */
export function AdminTableSkeleton({
  caption,
  columns,
  rows = 8,
  hiddenFromSm = [],
  hiddenFromMd = [],
}: AdminTableSkeletonProps) {
  return (
    <div
      className="relative max-w-full overflow-hidden rounded-card border border-line bg-paper"
      role="status"
      aria-busy="true"
      aria-label="Loading table"
    >
      <div className="bg-paper/40 pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-pine" aria-hidden />
        <span className="sr-only">Loading</span>
      </div>
      <div className="overflow-x-auto opacity-60">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line">
            <tr className="font-body text-micro uppercase text-ink-muted">
              {columns.map((label, i) => (
                <th
                  key={label}
                  scope="col"
                  className={[
                    'px-4 py-3',
                    hiddenFromSm.includes(i) ? 'hidden sm:table-cell' : '',
                    hiddenFromMd.includes(i) ? 'hidden md:table-cell' : '',
                    i === columns.length - 1 ? 'text-right' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, row) => (
              <tr key={row} className="border-b border-line last:border-0">
                {columns.map((_, col) => (
                  <td
                    key={col}
                    className={[
                      'px-4 py-3',
                      hiddenFromSm.includes(col) ? 'hidden sm:table-cell' : '',
                      hiddenFromMd.includes(col) ? 'hidden md:table-cell' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div
                      className={`h-4 animate-pulse rounded bg-panel ${
                        col === 0 ? 'w-32' : 'w-20'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCustomerHeaderSkeleton() {
  return (
    <header
      className="rounded-card border border-line bg-paper p-5 md:p-6"
      aria-busy="true"
      role="status"
    >
      <div className="h-3 w-20 animate-pulse rounded bg-panel" />
      <div className="mt-3 h-8 w-64 animate-pulse rounded bg-panel" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-panel" />
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-panel" />
        ))}
      </div>
    </header>
  );
}

export function AdminFormSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 rounded-card border border-line bg-paper p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading form"
    >
      <div className="flex items-center justify-center py-8">
        <Loader2 size={28} className="animate-spin text-pine" />
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-panel" />
          <div className="h-10 w-full animate-pulse rounded-tile bg-panel" />
        </div>
      ))}
    </div>
  );
}

/** Default `/admin/*` route transition placeholder. */
export function AdminRouteLoadingSkeleton() {
  return (
    <>
      <AdminBannerPlaceholder />
      <AdminPageHeaderSkeleton />
      <AdminTableSkeleton
        caption="Loading"
        columns={['Column A', 'Column B', 'Column C', 'Actions']}
      />
    </>
  );
}
