import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KeycloakProvider from 'next-auth/providers/keycloak';
import type { JWT } from 'next-auth/jwt';
import { isAdminRole } from '@/lib/auth/roles';

type TokenPayload = {
  sub?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  preferred_username?: string;
};

type KeycloakTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type KeycloakCredentialsUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  keycloakToken: string;
  preferredUsername?: string;
  roles: string[];
  isAdmin: boolean;
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

function extractRolesFromToken(token: string, clientId?: string): string[] {
  const roles = new Set<string>();
  const decoded = decodeJwtPayload(token);

  decoded?.realm_access?.roles?.forEach((role) => roles.add(role));

  if (clientId) {
    decoded?.resource_access?.[clientId]?.roles?.forEach((role) => roles.add(role));
  }

  return [...roles];
}

function logKeycloakTokenOnLogin(provider: string, token?: string) {
  if (process.env.NODE_ENV !== 'development' || !token) {
    return;
  }

  console.log(`[auth] Keycloak token from ${provider}:`, token);
}

async function authorizeWithKeycloak(
  username: string,
  password: string
): Promise<KeycloakCredentialsUser | null> {
  const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/rest-api';
  const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    username,
    password,
    scope: 'openid profile email',
  });


  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => '');
    let error: KeycloakTokenResponse | null = null;
    try {
      error = responseText ? (JSON.parse(responseText) as KeycloakTokenResponse) : null;
    } catch {
      error = null;
    }

    console.error('Keycloak password grant failed', {
      status: response.status,
      error: error?.error,
      errorDescription: error?.error_description,
      responseText: error ? undefined : responseText,
    });
    return null;
  }

  const tokenResponse = (await response.json()) as KeycloakTokenResponse;
  const keycloakToken = tokenResponse.access_token ?? tokenResponse.id_token;
  console.log('Keycloak token:', keycloakToken);
  if (!keycloakToken) {
    return null;
  }

  const decoded = decodeJwtPayload(tokenResponse.id_token ?? keycloakToken);
  const roles = extractRolesFromToken(keycloakToken, clientId);
  const firstName = decoded?.given_name ?? '';
  const lastName = decoded?.family_name ?? '';
  const fullName = decoded?.name ?? [firstName, lastName].filter(Boolean).join(' ');

  return {
    id: decoded?.sub ?? decoded?.preferred_username ?? username,
    email: decoded?.email,
    name: fullName || decoded?.preferred_username || username,
    image: decoded?.picture,
    keycloakToken,
    preferredUsername: decoded?.preferred_username ?? username,
    roles,
    isAdmin: isAdminRole(roles),
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'dev-only-secret-change-in-production',
  providers: [
    KeycloakProvider({
      id: 'keycloak-google',
      name: 'Google',
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/rest-api',
      authorization: {
        params: {
          scope: 'openid email profile',
          kc_idp_hint: 'google',
        },
      },
    }),
    KeycloakProvider({
      id: 'keycloak-github',
      name: 'GitHub',
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      issuer: process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/rest-api',
      authorization: {
        params: {
          scope: 'openid email profile',
          kc_idp_hint: 'github',
        },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Keycloak Credentials',
      credentials: {
        username: { label: 'Username or email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;
        if (!username || !password) {
          return null;
        }

        return authorizeWithKeycloak(username, password);
      },
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
        const credentialsUser = user as KeycloakCredentialsUser;
        token.sub = credentialsUser.id;
        token.name = credentialsUser.name;
        token.email = credentialsUser.email;
        token.picture = credentialsUser.image;
        token.keycloakToken = credentialsUser.keycloakToken;
        token.roles = credentialsUser.roles;
        token.isAdmin = credentialsUser.isAdmin;
        token.preferredUsername = credentialsUser.preferredUsername;
        token.imageUrl = credentialsUser.image;
        return token;
      }

      if (account?.access_token || account?.id_token) {
        token.keycloakToken = account.access_token ?? account.id_token;
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
      session.keycloakToken = token.keycloakToken;
      session.user.image =
        typeof token.imageUrl === 'string'
          ? token.imageUrl
          : typeof token.picture === 'string'
            ? token.picture
            : session.user.image;

      return session;
    },
  },
};
