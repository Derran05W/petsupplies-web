import { brand } from '@/lib/config/brand';

export function PrivacySection() {
  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="scroll-mt-24 rounded-card border border-line bg-paper p-6 md:p-8"
    >
      <h2
        id="privacy-heading"
        className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
      >
        Privacy & data
      </h2>
      <p className="mb-6 font-body text-sm text-ink-secondary">
        Marketing preferences live under Notifications. For a copy of your data
        or other privacy requests, email our team.
      </p>
      <a
        href={`mailto:${brand.supportEmail}?subject=Data%20request`}
        className="inline-flex rounded-tile border border-line bg-panel px-4 py-3 font-body text-sm font-medium text-ink transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
      >
        Request my data ({brand.supportEmail})
      </a>
    </section>
  );
}
