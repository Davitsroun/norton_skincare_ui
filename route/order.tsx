import { apiBaseUrl } from '@/constant/baseurl';
import type { OrderItemsListParams, OrderListParams } from '@/types/order-api';

const v1 = `${apiBaseUrl.baseUrl}/api/v1`;

/** Customer checkout & order resource */
export const orderRoute = {
  orders: () => `${v1}/orders`,
  /** Active / open checkout only — `pending` or `processing`. Empty after payment if no other open cart. */
  ordersList: (params?: OrderListParams): string => {
    const search = new URLSearchParams();
    search.set('page', String(params?.page ?? 0));
    search.set('size', String(params?.size ?? 50));
    return `${v1}/orders?${search.toString()}`;
  },
  /** Paid / completed orders (same order shape as the active list API). */
  ordersHistoryList: (params?: OrderListParams): string => {
    const search = new URLSearchParams();
    search.set('page', String(params?.page ?? 0));
    search.set('size', String(params?.size ?? 50));
    return `${v1}/orders/history?${search.toString()}`;
  },
  /** Single order by UUID (not `/history`). */
  orderById: (orderId: string): string =>
    `${v1}/orders/${encodeURIComponent(orderId)}`,
};

/** Manual / admin line items (separate from POST /orders with items[]) */
export const orderItemRoute = {
  collection: (params?: OrderItemsListParams): string => {
    const search = new URLSearchParams();
    if (params?.page !== undefined) {
      search.set('page', String(params.page));
    }
    if (params?.size !== undefined) {
      search.set('size', String(params.size));
    }
    const q = search.toString();
    return q ? `${v1}/order-items?${q}` : `${v1}/order-items`;
  },
  byId: (id: string): string => `${v1}/order-items/${encodeURIComponent(id)}`,
};
