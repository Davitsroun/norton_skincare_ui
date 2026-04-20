'use client';

import { AdminLayout } from '@/components/admin-layout';
import { AdminProtectedRoute } from '@/components/admin-protected-route';

interface AdminPageShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AdminPageShell({
  children,
  title,
  description,
}: AdminPageShellProps) {
  return (
    <AdminProtectedRoute>
      <AdminLayout title={title} description={description}>
        {children}
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
