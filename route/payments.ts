import { apiBaseUrl } from '@/constant/baseurl';

const base = `${apiBaseUrl.baseUrl}/api/v1/payments`;

export function paymentsRouteCollection(): string {
  return base;
}

export function paymentsRouteById(paymentId: string): string {
  return `${base}/${encodeURIComponent(paymentId)}`;
}
