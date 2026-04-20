'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Package,
  AlertCircle,
  Percent,
  Users,
  LogOut,
  Settings,
} from 'lucide-react';
import { LogoutConfirm } from '@/components/logout-confirm';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
  { label: 'Products', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Statistics', href: '/admin/statistics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Stock', href: '/admin/stock', icon: <AlertCircle className="w-5 h-5" /> },
  { label: 'Offers', href: '/admin/offers', icon: <Percent className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary to-primary/90 text-white overflow-y-auto z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Nature Leaf</h1>
            <p className="text-xs text-white/70">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-primary font-semibold shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
        <LogoutConfirm
          renderTrigger={(open) => (
            <button
              type="button"
              onClick={open}
              className="flex items-center gap-3 w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          )}
        />
      </div>
    </aside>
  );
}
