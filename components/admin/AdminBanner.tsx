import { Shield } from 'lucide-react';

/**
 * Thin warm-100 strip rendered above the admin page heading. The same
 * Supabase session signs both the customer and admin surfaces, so this
 * banner makes "you're on the admin surface" instantly obvious to the
 * eye — preventing the "I thought I was on /products" class of
 * accidental edits.
 */
export function AdminBanner() {
  return (
    <div
      role="note"
      className="mb-6 inline-flex items-center gap-2 rounded-md border border-warm-200 bg-warm-100 px-3 py-1.5 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600"
    >
      <Shield size={12} aria-hidden />
      <span>Admin</span>
    </div>
  );
}
