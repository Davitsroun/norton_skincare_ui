import type { ReactNode } from 'react';
import { AdminProtectedRoute } from '@/components/admin-protected-route';

interface AdminGroupLayoutProps {
  children: ReactNode;
}

export default function AdminGroupLayout({ children }: AdminGroupLayoutProps) {
  return <AdminProtectedRoute>{children}</AdminProtectedRoute>;
}
