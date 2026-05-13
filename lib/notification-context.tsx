'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  deleteUserNotificationAction,
  listMineUserNotificationsAction,
  updateUserNotificationAction,
} from '@/actions/user-notification-actions';
import type { UserNotificationApi } from '@/types/user-notification';

export interface Notification {
  id: string;
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
  /** Backend notification type label (CUSTOM, PAYMENT_SUCCESS, …) */
  apiType?: string;
}

function mapApiNotificationToUi(n: UserNotificationApi): Notification {
  const apiTypeUpper = (n.type || '').toUpperCase();

  let icon = 'info';
  if (
    apiTypeUpper.includes('PAYMENT') ||
    apiTypeUpper.includes('ORDER') ||
    apiTypeUpper.includes('CART')
  ) {
    icon = 'shopping-cart';
  } else if (apiTypeUpper.includes('SHIP') || apiTypeUpper.includes('PACKAGE')) {
    icon = 'package';
  } else if (apiTypeUpper.includes('GIFT') || apiTypeUpper.includes('PROMO')) {
    icon = 'gift';
  }

  let uiType: Notification['type'] = 'info';
  if (apiTypeUpper.includes('ERROR') || apiTypeUpper.includes('FAIL')) {
    uiType = 'error';
  } else if (apiTypeUpper.includes('WARN')) {
    uiType = 'warning';
  } else if (
    apiTypeUpper.includes('SUCCESS') ||
    apiTypeUpper.includes('PAYMENT') ||
    apiTypeUpper.includes('COMPLETE')
  ) {
    uiType = 'success';
  }

  const ts =
    (n.createdAt && !Number.isNaN(Date.parse(n.createdAt)) && new Date(n.createdAt)) || new Date();

  return {
    id: n.id,
    title: n.title || 'Notification',
    message: n.body || '',
    icon,
    timestamp: ts,
    read: n.read,
    type: uiType,
    apiType: n.type,
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<UserNotificationApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (status !== 'authenticated') {
      setItems([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await listMineUserNotificationsAction();
      if (result.success && result.data) {
        setItems(result.data);
      } else {
        setItems([]);
        setError(result.error ?? 'Could not load notifications.');
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      void refreshNotifications();
    } else {
      setItems([]);
      setError(null);
    }
  }, [status, refreshNotifications]);

  const notifications = useMemo(() => items.map(mapApiNotificationToUi), [items]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAsRead = useCallback(
    async (id: string) => {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      const res = await updateUserNotificationAction(id, { read: true });
      if (!res.success) {
        await refreshNotifications();
      }
    },
    [refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) {
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    const results = await Promise.all(
      unread.map((n) => updateUserNotificationAction(n.id, { read: true }))
    );
    if (results.some((r) => !r.success)) {
      await refreshNotifications();
    }
  }, [items, refreshNotifications]);

  const removeNotification = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((n) => n.id !== id));
      const res = await deleteUserNotificationAction(id);
      if (!res.success) {
        await refreshNotifications();
      }
    },
    [refreshNotifications]
  );

  const clearAll = useCallback(async () => {
    if (items.length === 0) {
      return;
    }
    const ids = items.map((n) => n.id);
    setItems([]);
    const results = await Promise.all(ids.map((id) => deleteUserNotificationAction(id)));
    if (results.some((r) => !r.success)) {
      await refreshNotifications();
    }
  }, [items, refreshNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
