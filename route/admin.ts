import { apiBaseUrl } from '@/constant/baseurl';

const v1 = `${apiBaseUrl.baseUrl}/api/v1/admin`;

export const adminRoute = {
  dashboardSummary: () => `${v1}/dashboard/summary`,
  dashboardRevenueChart: (params?: { from?: string; to?: string }): string => {
    const q = new URLSearchParams();
    if (params?.from) {
      q.set('from', params.from);
    }
    if (params?.to) {
      q.set('to', params.to);
    }
    const s = q.toString();
    return s ? `${v1}/dashboard/revenue-chart?${s}` : `${v1}/dashboard/revenue-chart`;
  },
  dashboardRecentOrders: (limit?: number): string => {
    const q = new URLSearchParams();
    if (limit != null) {
      q.set('limit', String(limit));
    }
    const s = q.toString();
    return s ? `${v1}/dashboard/orders/recent?${s}` : `${v1}/dashboard/orders/recent`;
  },
  orders: (params?: { page?: number; size?: number; status?: string }): string => {
    const q = new URLSearchParams();
    if (params?.page !== undefined) {
      q.set('page', String(params.page));
    }
    if (params?.size !== undefined) {
      q.set('size', String(params.size));
    }
    if (params?.status) {
      q.set('status', params.status);
    }
    const s = q.toString();
    return s ? `${v1}/orders?${s}` : `${v1}/orders`;
  },
  orderStatus: (orderId: string): string =>
    `${v1}/orders/${encodeURIComponent(orderId)}/status`,
  users: (params?: { page?: number; size?: number }): string => {
    const q = new URLSearchParams();
    if (params?.page !== undefined) {
      q.set('page', String(params.page));
    }
    if (params?.size !== undefined) {
      q.set('size', String(params.size));
    }
    const s = q.toString();
    return s ? `${v1}/users?${s}` : `${v1}/users`;
  },
  products: (params?: { page?: number; size?: number }): string => {
    const q = new URLSearchParams();
    if (params?.page !== undefined) {
      q.set('page', String(params.page));
    }
    if (params?.size !== undefined) {
      q.set('size', String(params.size));
    }
    const s = q.toString();
    return s ? `${v1}/products?${s}` : `${v1}/products`;
  },
  productById: (id: string): string => `${v1}/products/${encodeURIComponent(id)}`,
  statistics: () => `${v1}/statistics`,
  statisticsOverview: () => `${v1}/statistics/overview`,
};
