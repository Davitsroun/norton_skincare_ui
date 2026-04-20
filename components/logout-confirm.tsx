'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type LogoutConfirmProps = {
  /** Renders the control that opens the dialog; call `open()` on click. */
  renderTrigger: (open: () => void) => ReactNode;
};

export function LogoutConfirm({ renderTrigger }: LogoutConfirmProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleConfirm = async () => {
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {renderTrigger(() => setOpen(true))}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out and need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isSigningOut}
              onClick={handleConfirm}
            >
              {isSigningOut ? 'Signing out…' : 'Log out'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
