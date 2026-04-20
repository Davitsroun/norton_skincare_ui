import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      roles: string[];
      isAdmin: boolean;
      username?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: string[];
    isAdmin?: boolean;
    keycloakToken?: string;
    preferredUsername?: string;
    imageUrl?: string;
  }
}
