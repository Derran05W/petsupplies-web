import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/LoginForm';
import { resolvePostLoginPath } from '@/lib/auth/post-login-redirect';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  title: `Sign in · ${brand.name}`,
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
      <LoginForm />
    </Suspense>
  );
}
