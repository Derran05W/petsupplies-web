import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  title: `Your account · ${brand.name}`,
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-warm-50 px-6 py-24">
      <div className="w-full max-w-md text-center">
        <p className="mb-3 font-body text-xs font-medium uppercase tracking-[0.08em] text-brand-600">
          {brand.name}
        </p>
        <h1 className="font-display text-3xl tracking-[-0.02em] text-warm-900">
          Your account
        </h1>
        <p className="mt-4 font-body text-sm text-warm-600">
          Signed in as{' '}
          <span className="font-medium text-warm-900">{user.email}</span>
        </p>
        <p className="mt-12 font-body text-xs uppercase tracking-[0.08em] text-warm-400">
          Phase 7 — full account pages coming soon
        </p>
      </div>
    </main>
  );
}
