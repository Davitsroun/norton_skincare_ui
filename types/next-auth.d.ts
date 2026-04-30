import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: string[];
      isAdmin: boolean;
      username?: string;
    };
    keycloakToken?: string;
    /** Session present but Keycloak tokens missing or refresh failed — sign in again */
    keycloakNeedsSignIn?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    isAdmin?: boolean;
    keycloakToken?: string;
    refreshToken?: string;
    keycloakSessionExpired?: boolean;
    preferredUsername?: string;
    imageUrl?: string;
  }
}
