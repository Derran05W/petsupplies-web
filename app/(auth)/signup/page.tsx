import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SignupForm } from '@/components/auth/SignupForm';
import { resolvePostLoginPath } from '@/lib/auth/post-login-redirect';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  title: `Create account · ${brand.name}`,
};

interface SignupPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { redirect: redirectTarget } = await searchParams;

  if (user) {
    redirect(resolvePostLoginPath(redirectTarget));
  }

  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
