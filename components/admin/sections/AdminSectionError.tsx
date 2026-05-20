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
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-body text-sm text-red-800"
    >
      {message}
    </p>
  );
}
