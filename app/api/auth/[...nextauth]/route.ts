import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';

const handler = NextAuth(authOptions);

type NextAuthRouteContext = {
  params: {
    nextauth: string[];
  };
};

export function GET(request: Request, context: NextAuthRouteContext) {
  if (new URL(request.url).pathname.endsWith('/api/auth/callback/credentials')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return handler(request, context);
}

export { handler as POST };
