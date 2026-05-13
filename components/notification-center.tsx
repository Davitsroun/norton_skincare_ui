'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/lib/notification-context';
import {
  type WebPushUiSnapshot,
  getWebPushEnrollmentSnapshot,
  requestWebPushSubscription,
} from '@/lib/onesignal';
import { Bell, X, Gift, Package, ShoppingCart, Info, BellOff, Loader2 } from 'lucide-react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [pushUi, setPushUi] = useState<WebPushUiSnapshot | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const { data: session } = useSession();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotification();

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'shopping-cart':
        return <ShoppingCart className="w-5 h-5 text-primary" />;
      case 'package':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (isOpen) {
      void refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void (async () => {
      const snapshot = await getWebPushEnrollmentSnapshot();
      setPushUi(snapshot);
    })();
  }, [isOpen]);

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer text-gray-600 transition-colors hover:text-primary"
      >
        <Bell className="w-5 h-6" />
        {unreadCount > 0 && (
         <span className="absolute right-0 top-0 flex h-4 w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          {/* Notification Center Popup */}
          <div className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Notification Center</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error ? (
              <div className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {error}
              </div>
            ) : null}

            {pushUi?.configured && pushUi.supported ? (
              <div className="mx-4 mt-3 rounded-lg border border-sky-100 bg-sky-50/90 px-3 py-2.5 text-sm text-sky-950">
                {pushUi.optedIn ? (
                  <p className="flex items-center gap-2">
                    <Bell className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>Browser notifications are enabled for this site.</span>
                  </p>
                ) : pushUi.permission === 'denied' ? (
                  <p className="flex items-start gap-2 text-amber-900">
                    <BellOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      Notifications are blocked in your browser. Allow notifications for this site in your browser
                      settings, then open this panel again.
                    </span>
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="min-w-0 pr-2">
                      Allow browser alerts for order updates and offers (works best while signed in).
                    </p>
                    <button
                      type="button"
                      disabled={pushBusy}
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
                      onClick={() => {
                        setPushBusy(true);
                        void requestWebPushSubscription(session?.user?.id ?? null)
                          .then(setPushUi)
                          .finally(() => setPushBusy(false));
                      }}
                    >
                      {pushBusy ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Enabling…
                        </>
                      ) : (
                        <>
                          <Bell className="h-3.5 w-3.5" aria-hidden />
                          Enable notifications
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Filter Tabs */}
            <div className="flex gap-2 px-4 pt-3 border-b border-gray-100">
              <h2 className="text-medium font-medium text-gray-900 mb-1">Earlier</h2>
              {/* <button type="button" className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900 mb-1">
           
              </button> */}
              {/* <button type="button" className="cursor-pointer rounded-full px-4 py-2 text-gray-500 hover:text-gray-700">
                This Week
              </button>
              <button type="button" className="cursor-pointer rounded-full px-4 py-2 text-gray-500 hover:text-gray-700">
                Earlier
              </button> */}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 h-40 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
                  <p className="text-sm">Loading notifications…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <BellOff className="w-5 h-5 text-gray-500" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        setSelectedNotification(notification.id);
                        void markAsRead(notification.id);
                      }}
                      className={`p-4 cursor-pointer transition-colors border-l-4 ${
                        !notification.read 
                          ? 'bg-primary/5 hover:bg-primary/10 border-primary' 
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(new Date(notification.timestamp))}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void removeNotification(notification.id);
                          }}
                          className="flex-shrink-0 cursor-pointer text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex gap-2 p-3 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="flex-1 cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void clearAll();
                    setIsOpen(false);
                  }}
                  className="flex-1 cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          </>
      )}

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <>
          <div
            className="fixed inset-0 z-50 cursor-pointer bg-black/50"
            onClick={() => setSelectedNotification(null)}
            aria-hidden
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Notification Details</h3>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            {notifications.find(n => n.id === selectedNotification) && (
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    {getIcon(notifications.find(n => n.id === selectedNotification)?.icon || '')}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {notifications.find(n => n.id === selectedNotification)?.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatTime(new Date(notifications.find(n => n.id === selectedNotification)?.timestamp || ''))}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 mb-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {notifications.find(n => n.id === selectedNotification)?.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    Got It
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void removeNotification(selectedNotification);
                      setSelectedNotification(null);
                    }}
                    className="flex-1 cursor-pointer rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
