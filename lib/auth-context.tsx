'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { signIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import type { ReactNode } from 'react';
import { registerAction } from '@/actions/auth-actions';
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
  login: (username: string, password: string) => Promise<LoginResult>;
  loginWithIdentityProvider: (provider: KeycloakIdentityProvider) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'imageUrl' | 'username'>>) => void;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  imageUrl?: string;
}

type RegisterResult = {
  success: boolean;
  error?: string;
  status?: number;
};

type LoginResult = {
  success: boolean;
  isAdmin: boolean;
};

type KeycloakIdentityProvider = 'google' | 'github';

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
  const login = async (username: string, password: string): Promise<LoginResult> => {
    const response = await signIn('credentials', {
      redirect: false,
      username,
      password,
      callbackUrl: '/home',
    });

    if (!response?.ok || response.error) {
      return { success: false, isAdmin: false };
    }

    return {
      success: true,
      isAdmin: false,
    };
  };

  const loginWithIdentityProvider = async (provider: KeycloakIdentityProvider): Promise<void> => {
    await signIn(`keycloak-${provider}`, { callbackUrl: '/home' });
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    return registerAction({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
    });
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
    loginWithIdentityProvider,
    register,
    logout,
    updateProfile,
    isAuthenticated: status === 'authenticated',
    hasRole,
    isAdmin: user?.isAdmin ?? hasRole(ADMIN_ROLE),
  } satisfies AuthContextType;
}
