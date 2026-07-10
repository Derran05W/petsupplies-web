import { adminSectionErrorMessage } from '@/lib/api/admin/error-messages';

interface AdminSectionErrorProps {
  err: unknown;
  fallback: string;
}

export function AdminSectionError({ err, fallback }: AdminSectionErrorProps) {
  const message = adminSectionErrorMessage(err, fallback);
  return (
    <p
      role="alert"
      className="rounded-card border border-danger-border bg-danger-surface px-5 py-4 font-body text-sm text-danger-solid"
    >
      {message}
    </p>
  );
}
