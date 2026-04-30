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
  refresh_token?: string;
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
  refreshToken?: string | null;
  preferredUsername?: string;
  roles: string[];
  isAdmin: boolean;
};

/** Seconds of skew before JWT `exp` when deciding to refresh Keycloak access token */
const KEYCLOAK_ACCESS_TOKEN_REFRESH_SKEW_MS = 30_000;

function getJwtExpMs(jwtLike: string): number | null {
  try {
    const segment = jwtLike.split('.')[1];
    if (!segment) {
      return null;
    }

    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

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
    scope: 'openid profile email offline_access',
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
    refreshToken: tokenResponse.refresh_token ?? null,
    preferredUsername: decoded?.preferred_username ?? username,
    roles,
    isAdmin: isAdminRole(roles),
  };
}

async function fetchKeycloakTokenRefresh(refreshToken: string): Promise<KeycloakTokenResponse | null> {
  const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8081/realms/rest-api';
  const clientId = process.env.KEYCLOAK_CLIENT_ID ?? 'oauth-admin-client';
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? '';
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  });
  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const responseText = await response.text().catch(() => '');
  if (!response.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[auth] Keycloak refresh failed', { status: response.status, responseText });
    }
    return null;
  }

  try {
    return JSON.parse(responseText) as KeycloakTokenResponse;
  } catch {
    return null;
  }
}

async function maybeRefreshKeycloakAccessToken(token: JWT): Promise<void> {
  const accessToken =
    typeof token.keycloakToken === 'string' ? token.keycloakToken : undefined;
  const refreshToken = typeof token.refreshToken === 'string' ? token.refreshToken : undefined;
  const now = Date.now();
  const expMs = accessToken ? getJwtExpMs(accessToken) : null;

  const accessMissingOrExpiredSoon =
    !accessToken ||
    expMs === null ||
    expMs - KEYCLOAK_ACCESS_TOKEN_REFRESH_SKEW_MS <= now;

  if (!accessMissingOrExpiredSoon) {
    return;
  }

  if (!refreshToken) {
    token.keycloakToken = undefined;
    token.refreshToken = undefined;
    token.keycloakSessionExpired = true;
    token.roles = [];
    token.isAdmin = false;
    return;
  }

  const refreshed = await fetchKeycloakTokenRefresh(refreshToken);
  const nextAccess = refreshed?.access_token ?? refreshed?.id_token;

  if (!nextAccess || !refreshed || refreshed.error) {
    token.keycloakToken = undefined;
    token.refreshToken = undefined;
    token.keycloakSessionExpired = true;
    token.roles = [];
    token.isAdmin = false;
    return;
  }

  token.keycloakToken = nextAccess;
  if (typeof refreshed.refresh_token === 'string' && refreshed.refresh_token.length > 0) {
    token.refreshToken = refreshed.refresh_token;
  }
  delete token.keycloakSessionExpired;
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
          scope: 'openid email profile offline_access',
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
          scope: 'openid email profile offline_access',
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
        if (typeof credentialsUser.refreshToken === 'string' && credentialsUser.refreshToken.length > 0) {
          token.refreshToken = credentialsUser.refreshToken;
        } else if (credentialsUser.refreshToken === null || credentialsUser.refreshToken === '') {
          token.refreshToken = undefined;
        }
        token.roles = credentialsUser.roles;
        token.isAdmin = credentialsUser.isAdmin;
        token.preferredUsername = credentialsUser.preferredUsername;
        token.imageUrl = credentialsUser.image;
        delete token.keycloakSessionExpired;
        return token;
      }

      if (account?.access_token || account?.id_token) {
        token.keycloakToken = account.access_token ?? account.id_token;
        logKeycloakTokenOnLogin(account.provider ?? 'keycloak-oauth', token.keycloakToken);
      }
      if (typeof account?.refresh_token === 'string' && account.refresh_token.length > 0) {
        token.refreshToken = account.refresh_token;
      }
      if (account) {
        delete token.keycloakSessionExpired;
      }

      const preferredUsername =
        profile && typeof profile === 'object'
          ? (profile as Record<string, unknown>).preferred_username
          : undefined;

      if (typeof preferredUsername === 'string' && !token.preferredUsername) {
        token.preferredUsername = preferredUsername;
      }

      if (typeof token.picture === 'string' && !token.imageUrl) {
        token.imageUrl = token.picture;
      }

      await maybeRefreshKeycloakAccessToken(token);

      if (token.keycloakSessionExpired) {
        token.roles = [];
        token.isAdmin = false;
      } else if (token.keycloakToken) {
        token.roles = extractKeycloakRoles(token, process.env.KEYCLOAK_CLIENT_ID);
        token.isAdmin = isAdminRole(token.roles);
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? '';
      session.user.roles = token.roles ?? [];
      session.user.isAdmin = Boolean(token.isAdmin);
      session.user.username = token.preferredUsername;
      session.keycloakNeedsSignIn = Boolean(token.keycloakSessionExpired);
      session.keycloakToken = token.keycloakSessionExpired ? undefined : token.keycloakToken;
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
