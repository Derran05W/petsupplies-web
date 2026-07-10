import { Shield } from 'lucide-react';

/**
 * Thin panel chip rendered above the admin page heading — a kicker-style
 * "Admin" label with an amber shield. The same Supabase session signs
 * both the customer and admin surfaces, so this banner makes "you're on
 * the admin surface" instantly obvious to the eye — preventing the "I
 * thought I was on /products" class of accidental edits.
 */
export function AdminBanner() {
  return (
    <div
      role="note"
      className="mb-6 inline-flex items-center gap-2 rounded-card border border-line bg-panel px-3 py-1.5 font-body text-kicker uppercase text-pine"
    >
      <Shield size={12} aria-hidden className="shrink-0 text-amber" />
      <span>Admin</span>
    </div>
  );
}
