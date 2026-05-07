import { apiBaseUrl } from '@/constant/baseurl';

const base = `${apiBaseUrl.baseUrl}/api/v1/favorite-brands`;

/** GET /favorite-brands?page=&size= */
export function favoriteBrandRouteList(page = 0, size = 10): string {
  const q = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return `${base}?${q.toString()}`;
}

/** POST /favorite-brands */
export function favoriteBrandRouteCollection(): string {
  return base;
}

/** DELETE /favorite-brands/{favoriteBrandId} */
export function favoriteBrandRouteById(favoriteBrandId: string): string {
  return `${base}/${encodeURIComponent(favoriteBrandId)}`;
}
