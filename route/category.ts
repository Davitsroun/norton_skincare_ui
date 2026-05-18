import { apiBaseUrl } from '@/constant/baseurl';

/** Public: `GET /api/v1/categories` */
export const categoryRoute = {
  list: () => `${apiBaseUrl.baseUrl}/api/v1/categories`,
};
