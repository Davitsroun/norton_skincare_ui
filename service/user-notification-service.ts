import { getKeycloakToken } from '@/constant/token';
import { normalizeUserNotificationsPayload } from '@/lib/normalize-user-notifications';
import {
  userNotificationRouteById,
  userNotificationRouteCollection,
  userNotificationRouteList,
} from '@/route/user-notification';
import type {
  UserNotificationApi,
  UserNotificationCreateBody,
  UserNotificationUpdateBody,
} from '@/types/user-notification';

export async function listMineUserNotificationsService(page = 0, size = 50): Promise<UserNotificationApi[]> {
  const url = userNotificationRouteList(page, size);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Notifications request failed (${response.status})`);
  }

  const raw: unknown = await response.json().catch(() => ({}));
  return normalizeUserNotificationsPayload(raw);
}

export async function updateUserNotificationService(
  id: string,
  body: UserNotificationUpdateBody
): Promise<void> {
  const url = userNotificationRouteById(id);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Update notification failed (${response.status})`);
  }
}

export async function deleteUserNotificationService(id: string): Promise<void> {
  const url = userNotificationRouteById(id);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Delete notification failed (${response.status})`);
  }
}

/** Optional: client-driven create (server usually inserts on payment success). */
export async function createUserNotificationService(body: UserNotificationCreateBody): Promise<void> {
  const url = userNotificationRouteCollection();
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Create notification failed (${response.status})`);
  }
}
