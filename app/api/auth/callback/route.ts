import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';
  const error = searchParams.get('error');

  if (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const safeNext = next.startsWith('/') ? next : '/account';
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'auth_callback_failed');
  return NextResponse.redirect(loginUrl);
}
