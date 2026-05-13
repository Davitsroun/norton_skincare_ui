import { apiBaseUrl } from '@/constant/baseurl';

const base = `${apiBaseUrl.baseUrl}/api/v1/user-notifications`;

/** GET /user-notifications?page=&size= */
export function userNotificationRouteList(page = 0, size = 50): string {
  const q = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return `${base}?${q.toString()}`;
}

/** GET /user-notifications/{id} */
export function userNotificationRouteById(id: string): string {
  return `${base}/${encodeURIComponent(id)}`;
}

/** POST /user-notifications */
export function userNotificationRouteCollection(): string {
  return base;
}
