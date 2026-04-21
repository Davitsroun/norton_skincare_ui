'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Menu, X, LogOut, ShoppingCart, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { NotificationCenter } from './notification-center';
import { LogoutConfirm } from './logout-confirm';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/home', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About Us' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/history', label: 'History' },
  ];

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
          <div className="flex items-center gap-4">
            <NotificationCenter />

            <button
              type="button"
              onClick={() => router.push('/favorites')}
              className="cursor-pointer text-gray-600 transition-colors hover:text-primary"
              aria-label="Favorites"
            >
              <Heart className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/cart')}
              className="relative cursor-pointer text-gray-600 transition-colors hover:text-primary"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartCount}
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
