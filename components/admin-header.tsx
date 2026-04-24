'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-4">
          {/* User profile — admin layout with sidebar (same as other admin pages) */}
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 pl-4 border-l border-gray-200 rounded-lg -mr-1 pr-1 py-1 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            title="My profile"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">My profile</p>
            </div>
            <img
              src={user?.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop'}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
