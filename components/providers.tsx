'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { NotificationProvider } from '@/lib/notification-context';
import { Toaster } from '@/components/ui/toaster';
import { ModernToastProvider } from '@/components/modern-toast';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>
          <ModernToastProvider>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </ModernToastProvider>
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
