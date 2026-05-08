import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  heading: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  /** Optional right-aligned action (e.g. "Add new address" button). */
  action?: React.ReactNode;
}

/**
 * Server-rendered page header for every `/account/*` page. Renders the
 * Fraunces `<h1>` (so the chrome doesn't dictate the heading), an
 * optional crumb trail above it, and an optional right-aligned action.
 */
export function PageHeader({
  heading,
  description,
  breadcrumb,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 font-body text-xs uppercase tracking-[0.08em] text-warm-600">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <li
                    key={`${item.label}-${idx}`}
                    className="flex items-center gap-1"
                  >
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="text-warm-600 transition-colors hover:text-warm-900"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={isLast ? 'text-warm-900' : 'text-warm-600'}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast && (
                      <span aria-hidden className="text-warm-400">
                        /
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900 md:text-4xl">
          {heading}
        </h1>
        {description && (
          <p className="font-body text-sm text-warm-600">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </header>
  );
}
