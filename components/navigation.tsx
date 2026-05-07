'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/lib/auth-context';
import { listOrdersAction } from '@/actions/order-actions';
import { listFavoriteBrandsAction } from '@/actions/favorite-brand-actions';
import type { Order } from '@/types/order';
import { Menu, X, LogOut, ShoppingCart, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { NotificationCenter } from './notification-center';
import { LogoutConfirm } from './logout-confirm';

function latestOrderPieceCount(orders: Order[]): number {
  if (orders.length === 0) {
    return 0;
  }
  const sorted = [...orders].sort((a, b) => {
    const db = Date.parse(`${b.date}T12:00:00`);
    const da = Date.parse(`${a.date}T12:00:00`);
    const safeB = Number.isNaN(db) ? 0 : db;
    const safeA = Number.isNaN(da) ? 0 : da;
    return safeB - safeA;
  });
  const latest = sorted[0];
  return latest?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [serverOrderQtyTotal, setServerOrderQtyTotal] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [ordersListSyncTick, setOrdersListSyncTick] = useState(0);
  const [favoriteBrandsSyncTick, setFavoriteBrandsSyncTick] = useState(0);

  /** Total pieces on latest server order only — not local `cart` (avoids stale/offline basket vs empty API). */
  const cartBadgeCount = serverOrderQtyTotal;
  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About Us' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/history', label: 'History' },
  ];

  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') {
      setFavoriteCount(0);
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await listFavoriteBrandsAction({ page: 0, size: 100 });
      if (cancelled) {
        return;
      }
      if (result.success && result.data) {
        setFavoriteCount(result.data.length);
      } else {
        setFavoriteCount(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, status, pathname, favoriteBrandsSyncTick]);

  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') {
      setServerOrderQtyTotal(0);
      return;
    }

    let cancelled = false;

    void (async () => {
      const result = await listOrdersAction({ page: 0, size: 50 });
      if (cancelled) {
        return;
      }
      if (result.success && result.data?.length) {
        setServerOrderQtyTotal(latestOrderPieceCount(result.data));
      } else {
        setServerOrderQtyTotal(0);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, status, pathname, ordersListSyncTick]);

  useEffect(() => {
    const bumpOrders = () => setOrdersListSyncTick((n) => n + 1);
    window.addEventListener('cart-orders-synced', bumpOrders);
    return () => window.removeEventListener('cart-orders-synced', bumpOrders);
  }, []);

  useEffect(() => {
    const bumpFav = () => setFavoriteBrandsSyncTick((n) => n + 1);
    window.addEventListener('favorite-brands-updated', bumpFav);
    return () => window.removeEventListener('favorite-brands-updated', bumpFav);
  }, []);

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/home"
            className="flex cursor-pointer items-center gap-2 text-xl font-bold text-primary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              ✓
            </div>
            <span className="hidden sm:inline">Nature Leaf</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'border-b-2 border-primary pb-1 text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 ">
            <NotificationCenter />

            <button
              type="button"
              onClick={() => router.push('/favorites')}
              className={`relative cursor-pointer transition-colors ${
                favoriteCount > 0 || pathname === '/favorites'
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-600 hover:text-primary'
              }`}
              aria-label="Favorites"
            >
              <Heart
                className={`h-6 w-6 ${favoriteCount > 0 || pathname === '/favorites' ? 'fill-current' : ''}`}
              />
              {favoriteCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-red-500 text-[10px] font-bold text-white">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/cart')}
              className="relative cursor-pointer text-gray-600 transition-colors hover:text-primary"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-white">
                  {cartBadgeCount > 99 ? '99+' : cartBadgeCount}
                </span>
              )}
            </button>

            <div className="hidden items-center gap-3 border-l border-gray-200 pl-4 sm:flex">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="cursor-pointer text-gray-600 transition-colors hover:text-primary"
                aria-label="Profile"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || user.username || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </button>

              <LogoutConfirm
                renderTrigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex cursor-pointer items-center gap-1 text-sm text-gray-600 transition-colors hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer text-gray-600 transition-colors hover:text-primary md:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="space-y-3 border-t border-gray-200 py-4 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <LogoutConfirm
              renderTrigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            />
          </div>
        )}
      </div>
    </nav>
  );
}
