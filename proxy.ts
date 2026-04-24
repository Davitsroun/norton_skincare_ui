import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicAuthPages = new Set(['/login', '/register', '/forgot-password']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret:
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET ??
      'dev-only-secret-change-in-production',
  });
  const isLoggedIn = Boolean(token);
  const roles = (token?.roles as string[] | undefined) ?? [];
  const isAdmin = roles.includes('admin') || Boolean(token?.isAdmin);

  if (pathname === '/') {
    return NextResponse.redirect(new URL(isLoggedIn ? (isAdmin ? '/admin' : '/home') : '/login', request.url));
  }

  if (!isLoggedIn && !publicAuthPages.has(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  if (publicAuthPages.has(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
