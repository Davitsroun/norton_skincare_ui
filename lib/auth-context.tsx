'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import type { ReactNode } from 'react';
import { ADMIN_ROLE, hasAnyRole } from '@/lib/auth/roles';

interface User {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  roles: string[];
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'imageUrl' | 'username'>>) => void;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
  isAdmin: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  imageUrl?: string;
}

type ProfileOverrides = Partial<
  Pick<User, 'firstName' | 'lastName' | 'email' | 'imageUrl' | 'username'>
>;

type AuthOverridesContextType = {
  overridesByUserId: Record<string, ProfileOverrides>;
  updateOverride: (userId: string, data: ProfileOverrides) => void;
};

const AUTH_OVERRIDES_STORAGE_KEY = 'auth-profile-overrides';

const AuthOverridesContext = createContext<AuthOverridesContextType | null>(null);

function mapSessionUser(sessionUser: NonNullable<ReturnType<typeof useSession>['data']>['user']): User {
  const fullName = sessionUser.name?.trim() ?? '';
  const [firstName = '', ...rest] = fullName.split(' ');

  return {
    id: sessionUser.id,
    username: sessionUser.username,
    email: sessionUser.email ?? '',
    firstName,
    lastName: rest.join(' '),
    imageUrl: sessionUser.image ?? undefined,
    roles: sessionUser.roles ?? [],
    isAdmin: sessionUser.isAdmin ?? false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [overridesByUserId, setOverridesByUserId] = useState<Record<string, ProfileOverrides>>({});

  useEffect(() => {
    try {
      const rawValue = localStorage.getItem(AUTH_OVERRIDES_STORAGE_KEY);
      if (rawValue) {
        const parsed = JSON.parse(rawValue) as Record<string, ProfileOverrides>;
        setOverridesByUserId(parsed);
      }
    } catch {
      setOverridesByUserId({});
    }
  }, []);

  const updateOverride = (userId: string, data: ProfileOverrides) => {
    setOverridesByUserId((prev) => {
      const next = {
        ...prev,
        [userId]: {
          ...(prev[userId] ?? {}),
          ...data,
        },
      };

      localStorage.setItem(AUTH_OVERRIDES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const contextValue = useMemo(
    () => ({
      overridesByUserId,
      updateOverride,
    }),
    [overridesByUserId]
  );

  return (
    <AuthOverridesContext.Provider value={contextValue}>
      {children}
    </AuthOverridesContext.Provider>
  );
}

export function useAuth() {
  const overridesContext = useContext(AuthOverridesContext);
  if (!overridesContext) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const { data, status } = useSession();
  const sessionUser = data?.user ? mapSessionUser(data.user) : null;
  const profileOverride = sessionUser
    ? overridesContext.overridesByUserId[sessionUser.id]
    : undefined;

  const user = sessionUser
    ? {
        ...sessionUser,
        ...profileOverride,
      }
    : null;
  const authMode = process.env.NEXT_PUBLIC_AUTH_MODE ?? 'mock';

  const login = async (email: string, password: string): Promise<boolean> => {
    if (authMode === 'mock') {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      return Boolean(result?.ok) && !result?.error;
    }

    await nextAuthSignIn('keycloak', { callbackUrl: '/home' });
    return true;
  };

  const register = async (_data: RegisterData): Promise<boolean> => {
    if (authMode === 'mock') {
      return false;
    }

    await nextAuthSignIn(
      'keycloak',
      { callbackUrl: '/home' },
      { kc_action: 'register' }
    );
    return true;
  };

  const logout = async (): Promise<void> => {
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  const updateProfile = (
    profileData: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'imageUrl' | 'username'>>
  ) => {
    if (!user) {
      return;
    }

    overridesContext.updateOverride(user.id, profileData);
  };

  const hasRole = (...roles: string[]) => {
    if (!user) {
      return false;
    }

    return hasAnyRole(user.roles, roles);
  };

  return {
    user,
    isLoading: status === 'loading',
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: status === 'authenticated',
    hasRole,
    isAdmin: user?.isAdmin ?? hasRole(ADMIN_ROLE),
  } satisfies AuthContextType;
}
