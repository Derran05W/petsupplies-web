import Link from 'next/link';
import { brand } from '@/lib/config/brand';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  href: string;
  label: string;
  Icon: () => JSX.Element;
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Dogs', href: '#' },
      { label: 'Cats', href: '#' },
      { label: 'Birds', href: '#' },
      { label: 'Small animals', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact', href: '#' },
      { label: 'Shipping', href: '#' },
      { label: 'Returns', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Sourcing', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
];

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

function buildSocials(): SocialLink[] {
  // brand.social.* values are typed as readonly string literals; cast to
  // string before we test so empty placeholders simply render nothing.
  const instagram = brand.social.instagram as string;
  const facebook = brand.social.facebook as string;
  const socials: SocialLink[] = [];
  if (instagram) {
    socials.push({ href: instagram, label: 'Instagram', Icon: InstagramIcon });
  }
  if (facebook) {
    socials.push({ href: facebook, label: 'Facebook', Icon: FacebookIcon });
  }
  return socials;
}

export function Footer() {
  const year = new Date().getFullYear();
  const socials = buildSocials();

  return (
    <footer className="mt-24 border-t border-warm-200 bg-warm-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 lg:px-12">
        <div>
          <Link
            href="/"
            aria-label={brand.name}
            className="inline-flex items-baseline gap-0.5 font-body text-lg font-medium text-warm-900"
          >
            {(() => {
              const words = brand.name.split(' ');
              const n = brand.logoAccentWords ?? 1;
              const accent = words.slice(0, n).join(' ');
              const rest = words.slice(n).join(' ');
              return (
                <>
                  <span className="text-brand-600">{accent}</span>
                  {rest && <span>{rest}</span>}
                </>
              );
            })()}
          </Link>
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

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              {column.title}
            </h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-warm-900 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
