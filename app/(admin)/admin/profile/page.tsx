'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { ProfileView } from '@/components/profile-view';

export default function AdminProfilePage() {
  return (
    <AdminPageShell
      title="My Profile"
      description="View and edit your profile."
    >
      <ProfileView variant="embedded" />
    </AdminPageShell>
  );
}
