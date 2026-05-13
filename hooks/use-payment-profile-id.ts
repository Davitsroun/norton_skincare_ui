import { useEffect, useState } from 'react';

export function paymentProfileStorageKey(userId: string) {
  return `norton:paymentProfileId:${userId}`;
}

export function usePaymentProfileId(options: {
  userId: string | undefined;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
}) {
  const { userId, authStatus } = options;
  const [storedId, setStoredId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }
    try {
      const existing = sessionStorage.getItem(paymentProfileStorageKey(userId));
      setStoredId(existing && existing.trim() !== '' ? existing.trim() : null);
    } catch {
      setStoredId(null);
    }
  }, [userId, authStatus]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setStoredId(null);
    }
  }, [authStatus]);

  const persist = (id: string | null) => {
    setStoredId(id);
    if (typeof window === 'undefined' || !userId) {
      return;
    }
    try {
      if (id && id.trim() !== '') {
        sessionStorage.setItem(paymentProfileStorageKey(userId), id.trim());
      } else {
        sessionStorage.removeItem(paymentProfileStorageKey(userId));
      }
    } catch {
      /* ignore */
    }
  };

  const clearStorage = () => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }
    try {
      sessionStorage.removeItem(paymentProfileStorageKey(userId));
    } catch {
      /* ignore */
    }
    setStoredId(null);
  };

  return { storedId, setStoredId: persist, clearStorage };
}
