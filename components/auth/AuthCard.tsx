import { cn } from '@/lib/utils';

interface AuthCardProps {
  heading: string;
  subtext?: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({
  heading,
  subtext,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-card border border-line bg-paper px-8 py-10',
        className,
      )}
    >
      <h1 className="font-display text-[1.9rem] font-normal leading-[1.12] tracking-tight-display text-ink">
        {heading}
      </h1>
      {subtext && (
        <p className="mt-2 font-body text-sm leading-body text-ink-secondary">
          {subtext}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
