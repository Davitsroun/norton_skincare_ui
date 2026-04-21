import type { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';

interface DashboardGroupLayoutProps {
  children: ReactNode;
}

export default function DashboardGroupLayout({
  children,
}: DashboardGroupLayoutProps) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
