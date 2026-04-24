'use client';

import { useState, useEffect } from 'react';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { ProfileView } from '@/components/profile-view';

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || isPageLoading) {
    return <SkeletonLoader />;
  }

  return <ProfileView variant="standalone" />;
}
