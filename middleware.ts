import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

function isProtected(pathname: string): boolean {
  return pathname.startsWith('/account') || pathname.startsWith('/admin');
}

function isAdminOnly(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/** Copy session cookies from one response onto a redirect response. */
function withSessionCookies(
  sessionResponse: NextResponse,
  redirect: NextResponse,
): NextResponse {
  sessionResponse.cookies.getAll().forEach(({ name, value }) => {
    redirect.cookies.set(name, value);
  });
  return redirect;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!isProtected(pathname)) return response;

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('redirect', pathname + search);
    return withSessionCookies(response, NextResponse.redirect(loginUrl));
  }

  if (
    isAdminOnly(pathname) &&
    // TODO(security): harden to app_metadata once API supports it
    (user.user_metadata as Record<string, unknown>)?.['role'] !== 'ADMIN'
  ) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.search = '';
    return withSessionCookies(response, NextResponse.redirect(homeUrl));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - /images/* (public images)
     * - /api/auth/callback (OAuth callback must run before session is read)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|images/|api/auth/callback).*)',
  ],
};
