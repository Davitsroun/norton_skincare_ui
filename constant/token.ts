'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

/** What your APIs expect when attaching the Keycloak access token */
export type KeycloakTokenPayload = {
  Credential: string | null;
  /** True when Keycloak access could not be refreshed — user should sign in again */
  needsReauthentication?: boolean;
};

/**
 * Returns a valid Keycloak access token when possible. On each call, the NextAuth JWT callback
 * runs (via getServerSession): it refreshes the Keycloak token if it is expired or near expiry
 * when a refresh token is available. Otherwise returns null and `needsReauthentication` is set on the session (client should sign out).
 */
export async function getKeycloakToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.keycloakNeedsSignIn) {
    return null;
  }
  return session?.keycloakToken ?? null;
}

/**
 * Same shape as before: `{ Credential, needsReauthentication? }`.
 */
export async function Token(): Promise<KeycloakTokenPayload> {
  const session = await getServerSession(authOptions);
  const needsReauthentication = Boolean(session?.keycloakNeedsSignIn);
  return {
    Credential: needsReauthentication ? null : (session?.keycloakToken ?? null),
    needsReauthentication: needsReauthentication || undefined,
  };
}
