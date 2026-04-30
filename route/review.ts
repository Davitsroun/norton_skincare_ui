import { apiBaseUrl } from '@/constant/baseurl';

const base = apiBaseUrl.baseUrl;

export const reviewRoute = {
  reviews: `${base}/api/v1/reviews`,
  reviewById: (id: string): string => `${base}/api/v1/reviews/${encodeURIComponent(id)}`,
};
