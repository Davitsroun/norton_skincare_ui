/**
 * Shapes aligned with Spring API: checkout uses POST /api/v1/orders;
 * line-item CRUD uses /api/v1/order-items (admin / manual edits).
 */

/** POST /api/v1/order-items — create */
export type OrderItemCreateRequest = {
  productId: string;
  quantity: number;
};

/** PUT /api/v1/order-items/{id} — your backend may accept full entity */
export type OrderItemUpdateRequest = {
  orderItemId: string;
  product: { productId: string };
  quantity: number;
  price: number;
};

/** POST /api/v1/orders — typical customer checkout body */
export type CreateOrderRequest = {
  items: OrderItemCreateRequest[];
  customerName?: string;
  contactNumber?: string;
  fulfillmentMethod?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentMethod?: string;
};

export type OrderItemsListParams = {
  page?: number;
  size?: number;
};

/** GET /api/v1/orders?page=&size= */
export type OrderListParams = {
  page?: number;
  size?: number;
};
