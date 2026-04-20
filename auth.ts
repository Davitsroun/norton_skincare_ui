import type { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import { isAdminRole } from '@/lib/auth/roles';
import { mockAuthUsers } from '@/lib/auth/mock-users';

type TokenPayload = {
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  preferred_username?: string;
};

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) {
      return null;
    }

    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(decoded) as TokenPayload;
  } catch {
    return null;
  }
}

function extractKeycloakRoles(jwtToken: JWT, clientId?: string): string[] {
  const roles = new Set<string>(jwtToken.roles ?? []);
  const decoded = jwtToken.keycloakToken ? decodeJwtPayload(jwtToken.keycloakToken) : null;

  decoded?.realm_access?.roles?.forEach((role) => roles.add(role));

  if (clientId) {
    decoded?.resource_access?.[clientId]?.roles?.forEach((role) => roles.add(role));
  }

  return [...roles];
}

function getMockUserImage(token: JWT): string | undefined {
  const tokenSub = typeof token.sub === 'string' ? token.sub : '';
  const tokenEmail = typeof token.email === 'string' ? token.email.toLowerCase() : '';

  const mockUser = mockAuthUsers.find(
    (user) => user.id === tokenSub || user.email.toLowerCase() === tokenEmail
  );

  return mockUser?.imageUrl;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'dev-only-secret-change-in-production',
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Mock Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const authMode = process.env.NEXT_PUBLIC_AUTH_MODE ?? 'mock';
        if (authMode !== 'mock') {
          return null;
        }

        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) {
          return null;
        }

        const foundUser = mockAuthUsers.find(
          (user) => user.email.toLowerCase() === email && user.password === password
        );

        if (!foundUser) {
          return null;
        }

        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          image: foundUser.imageUrl,
          roles: foundUser.roles,
        };
      },
    }),
    KeycloakProvider({
      issuer: process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/rest-api',
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? 'replace-me',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === 'credentials' && user) {
        const roles =
          'roles' in user && Array.isArray((user as Record<string, unknown>).roles)
            ? ((user as Record<string, unknown>).roles as string[])
            : [];
        token.roles = roles;
        token.isAdmin = isAdminRole(roles);
        token.preferredUsername =
          user.email?.split('@')[0] ?? user.name ?? token.preferredUsername;
        token.imageUrl = user.image ?? token.imageUrl;
        return token;
      }

      if (account?.id_token || account?.access_token) {
        token.keycloakToken = account.id_token ?? account.access_token;
      }

      const preferredUsername =
        profile && typeof profile === 'object'
          ? (profile as Record<string, unknown>).preferred_username
          : undefined;

      if (typeof preferredUsername === 'string' && !token.preferredUsername) {
        token.preferredUsername = preferredUsername;
      }

      if (token.keycloakToken) {
        token.roles = extractKeycloakRoles(token, process.env.KEYCLOAK_CLIENT_ID);
        token.isAdmin = isAdminRole(token.roles);
      }

      if (typeof token.picture === 'string' && !token.imageUrl) {
        token.imageUrl = token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? '';
      session.user.roles = token.roles ?? [];
      session.user.isAdmin = Boolean(token.isAdmin);
      session.user.username = token.preferredUsername;
      const mockImage = getMockUserImage(token);
      session.user.image =
        typeof token.imageUrl === 'string'
          ? token.imageUrl
          : typeof mockImage === 'string'
            ? mockImage
          : typeof token.picture === 'string'
            ? token.picture
            : session.user.image;

      return session;
    },
  },
};
