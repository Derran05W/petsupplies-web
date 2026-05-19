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
        'w-full max-w-md rounded-xl border border-warm-200 bg-surface-card px-8 py-10 shadow-sm',
        className,
      )}
    >
      <h1 className="font-display text-3xl font-normal tracking-[-0.02em] text-warm-900">
        {heading}
      </h1>
      {subtext && (
        <p className="mt-2 font-body text-sm leading-relaxed text-warm-600">
          {subtext}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
