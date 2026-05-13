'use server';

import {
  createUserNotificationService,
  deleteUserNotificationService,
  listMineUserNotificationsService,
  updateUserNotificationService,
} from '@/service/user-notification-service';
import type {
  UserNotificationApi,
  UserNotificationCreateBody,
  UserNotificationUpdateBody,
} from '@/types/user-notification';

export type UserNotificationActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function listMineUserNotificationsAction(): Promise<
  UserNotificationActionResult<UserNotificationApi[]>
> {
  try {
    const data = await listMineUserNotificationsService(0, 50);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load notifications.';
    return { success: false, error: message };
  }
}

export async function updateUserNotificationAction(
  id: string,
  body: UserNotificationUpdateBody
): Promise<UserNotificationActionResult<void>> {
  try {
    await updateUserNotificationService(id, body);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update notification.';
    return { success: false, error: message };
  }
}

export async function deleteUserNotificationAction(id: string): Promise<UserNotificationActionResult<void>> {
  try {
    await deleteUserNotificationService(id);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete notification.';
    return { success: false, error: message };
  }
}

export async function createUserNotificationAction(
  body: UserNotificationCreateBody
): Promise<UserNotificationActionResult<void>> {
  try {
    await createUserNotificationService(body);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create notification.';
    return { success: false, error: message };
  }
}
