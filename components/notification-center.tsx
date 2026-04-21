'use client';

import { useState } from 'react';
import { useNotification } from '@/lib/notification-context';
import { Bell, X, Gift, Package, ShoppingCart, Info } from 'lucide-react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification();

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

  const groupedNotifications = {
    today: notifications.filter((n) => {
      const now = new Date();
      const notifDate = new Date(n.timestamp);
      return now.toDateString() === notifDate.toDateString();
    }),
    thisWeek: notifications.filter((n) => {
      const now = new Date();
      const notifDate = new Date(n.timestamp);
      const daysAgo = Math.floor((now.getTime() - notifDate.getTime()) / 86400000);
      return daysAgo >= 1 && daysAgo < 7;
    }),
    earlier: notifications.filter((n) => {
      const now = new Date();
      const notifDate = new Date(n.timestamp);
      const daysAgo = Math.floor((now.getTime() - notifDate.getTime()) / 86400000);
      return daysAgo >= 7;
    }),
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer text-gray-600 transition-colors hover:text-primary"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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

            {/* Filter Tabs */}
            <div className="flex gap-2 px-4 pt-3 border-b border-gray-100">
              <button type="button" className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900">
                Today
              </button>
              <button type="button" className="cursor-pointer rounded-full px-4 py-2 text-gray-500 hover:text-gray-700">
                This Week
              </button>
              <button type="button" className="cursor-pointer rounded-full px-4 py-2 text-gray-500 hover:text-gray-700">
                Earlier
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        setSelectedNotification(notification.id);
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
                            removeNotification(notification.id);
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
                  onClick={() => {
                    markAllAsRead();
                  }}
                  className="flex-1 cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
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
                      removeNotification(selectedNotification);
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
