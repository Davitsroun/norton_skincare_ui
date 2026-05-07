import { apiBaseUrl } from '@/constant/baseurl';

const base = `${apiBaseUrl.baseUrl}/api/v1/payment-profiles`;

export const paymentProfileRoute = {
  collection: () => base,
  byId: (id: string) => `${base}/${encodeURIComponent(id)}`,
};
