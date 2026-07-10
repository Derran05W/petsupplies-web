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
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 font-body text-micro uppercase text-ink-muted">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <li
                    key={`${item.label}-${idx}`}
                    className="flex items-center gap-1.5"
                  >
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="text-ink-muted transition-colors duration-fast hover:text-ink"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={isLast ? 'text-ink' : 'text-ink-muted'}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast && (
                      <span aria-hidden className="text-ink-faint">
                        /
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="font-display text-display text-ink">{heading}</h1>
        {description && (
          <p className="max-w-2xl font-body text-sm leading-body text-ink-secondary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </header>
  );
}
