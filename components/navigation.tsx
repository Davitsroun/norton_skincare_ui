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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              ✓
            </div>
            <span className="hidden sm:inline">Nature Leaf</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary pb-1'
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
            {/* Notification Center */}
            <NotificationCenter />

            {/* Favorites Icon */}
            <button
              onClick={() => router.push('/favorites')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => router.push('/cart')}
              className="text-gray-600 hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile & Profile Link */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
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
              <LogoutConfirm
                renderTrigger={(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 hover:text-primary transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
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
