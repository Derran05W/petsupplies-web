import Link from 'next/link';
import type { Brand } from '@/lib/config/brand';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { fetchSiteNav } from '@/lib/api/site/nav';
import { resolveFooterColumns } from '@/lib/site/nav-display';
import type { FooterColumn } from '@/types/site';

interface SocialLink {
  href: string;
  label: string;
  Icon: () => JSX.Element;
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function buildSocials(brand: Brand): SocialLink[] {
  const socials: SocialLink[] = [];
  if (brand.social.instagram) {
    socials.push({
      href: brand.social.instagram,
      label: 'Instagram',
      Icon: InstagramIcon,
    });
  }
  if (brand.social.facebook) {
    socials.push({
      href: brand.social.facebook,
      label: 'Facebook',
      Icon: FacebookIcon,
    });
  }
  return socials;
}

function footerLinkKey(columnKey: string, link: FooterColumn['links'][number]) {
  return `${columnKey}-${link.href}-${link.position}`;
}

export async function Footer({ brand }: { brand: Brand }) {
  const { footer } = await fetchSiteNav();
  const columns = resolveFooterColumns(footer);
  const year = new Date().getFullYear();
  const socials = buildSocials(brand);

  return (
    <footer className="mt-24 border-t border-warm-200 bg-warm-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 lg:px-12">
        <div>
          <BrandLogo brand={brand} />
          <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-warm-600">
            {brand.tagline}
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-warm-200 text-warm-600 transition-colors hover:border-warm-300 hover:text-warm-900"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {columns.map(({ column, links }) => (
          <div key={column.key}>
            <h2 className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              {column.label}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {links.map((link) => {
                const isExternal =
                  link.href.startsWith('http') ||
                  link.href.startsWith('mailto:');
                return (
                  <li key={footerLinkKey(column.key, link)}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        className="font-body text-sm text-warm-900 transition-colors hover:text-brand-600"
                        {...(link.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-body text-sm text-warm-900 transition-colors hover:text-brand-600"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-warm-200">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
          <p className="font-body text-xs text-warm-400">
            © {year} {brand.name}. All rights reserved.
          </p>
          <p className="font-body text-xs text-warm-400">
            <a
              href={`mailto:${brand.supportEmail}`}
              className="hover:text-warm-600"
            >
              {brand.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
