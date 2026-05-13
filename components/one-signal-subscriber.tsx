'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ensureOneSignalInitialized, oneSignalLogin, oneSignalLogout } from '@/lib/onesignal';

/**
 * Subscribes the browser to OneSignal with `external_id = session.user.id` (Keycloak sub).
 * No-op when NEXT_PUBLIC_ONESIGNAL_APP_ID is unset.
 */
export function OneSignalSubscriber() {
  const { data: session, status } = useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await ensureOneSignalInitialized();
      if (cancelled) {
        return;
      }

      if (status === 'authenticated' && session?.user?.id) {
        const id = session.user.id;
        if (lastUserId.current !== id) {
          lastUserId.current = id;
          if (!cancelled) {
            await oneSignalLogin(id);
          }
        }
      } else if (status === 'unauthenticated') {
        lastUserId.current = null;
        if (!cancelled) {
          await oneSignalLogout();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status]);

  return null;
}
