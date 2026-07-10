import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Pill CTA from the mockup (`.btn`):
 *   - solid — ink fill; hover turns pine and lifts 2px
 *   - ghost — outlined; hover fills ink and lifts 2px
 * Renders a `<Link>` when `href` is given, otherwise a `<button>`.
 */
type ButtonVariant = 'solid' | 'ghost';

const BASE =
  'inline-block rounded-pill border border-ink px-[2.2rem] py-4 text-center font-body text-button uppercase no-underline transition-all duration-base ease-soft cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine motion-reduce:transform-none';

const VARIANT: Record<ButtonVariant, string> = {
  solid:
    'bg-ink text-paper hover:border-pine hover:bg-pine hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-ink hover:bg-ink hover:text-paper hover:-translate-y-0.5',
};

interface ButtonAsLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  href: string;
}

interface ButtonAsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: undefined;
}

type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

export function Button({
  variant = 'solid',
  className,
  ...props
}: ButtonProps) {
  const classes = cn(BASE, VARIANT[variant], className);
  if (props.href !== undefined) {
    const { href, ...anchorProps } = props as ButtonAsLinkProps;
    return <Link href={href} className={classes} {...anchorProps} />;
  }
  const { type = 'button', ...buttonProps } = props as ButtonAsButtonProps;
  return <button type={type} className={classes} {...buttonProps} />;
}
