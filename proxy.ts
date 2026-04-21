import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicAuthPages = new Set(['/login', '/register', '/forgot-password']);
const protectedPrefixes = ['/home', '/shop', '/about', '/favorites', '/history', '/cart', '/profile'];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
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

  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  if (startsWithAny(pathname, protectedPrefixes) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (publicAuthPages.has(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
