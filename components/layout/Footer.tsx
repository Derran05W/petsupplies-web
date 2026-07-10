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
    <footer className="mt-24 border-t border-line bg-panel text-ink">
      <div className="mx-auto grid max-w-wrap gap-10 px-gutter py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandLogo brand={brand} />
          <p className="mt-3 max-w-xs font-body text-sm leading-body text-ink-secondary">
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
                    className="inline-flex size-9 items-center justify-center rounded-tile border border-line text-ink-muted transition-colors duration-fast hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
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
            <h2 className="font-body text-kicker uppercase text-pine">
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
                        className="font-body text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
                        {...(link.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-body text-sm text-ink-muted transition-colors duration-fast hover:text-ink"
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

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-wrap flex-col items-start gap-2 px-gutter py-6 md:flex-row md:items-center md:justify-between">
          <p className="font-body text-micro uppercase text-ink-faint">
            © {year} {brand.name}. All rights reserved.
          </p>
          <p className="font-body text-micro text-ink-faint">
            <a
              href={`mailto:${brand.supportEmail}`}
              className="uppercase transition-colors duration-fast hover:text-ink"
            >
              {brand.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
