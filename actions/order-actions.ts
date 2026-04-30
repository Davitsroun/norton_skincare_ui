'use server';

import {
  createOrderService,
  createOrderItemService,
  deleteOrderItemService,
  getOrderItemByIdService,
  listOrderItemsService,
  listOrdersService,
  updateOrderItemService,
} from '@/service/order-service';
import type {
  CreateOrderRequest,
  OrderItemCreateRequest,
  OrderItemUpdateRequest,
  OrderItemsListParams,
  OrderListParams,
} from '@/types/order-api';
import type { Order } from '@/types/order';

export type OrderActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Persist checkout to the backend via `POST /api/v1/orders`.
 * Triggered only from cart `placeOrder`: delivery submits on “Place Delivery Order”;
 * pickup submits on “I Have Paid” after the QR step — not when opening that step.
 */
export async function createOrderAction(
  payload: CreateOrderRequest
): Promise<OrderActionResult<unknown>> {
  try {
    const data = await createOrderService(payload);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order.';
    return { success: false, error: message };
  }
}

export async function listOrdersAction(params?: OrderListParams): Promise<OrderActionResult<Order[]>> {
  try {
    const data = await listOrdersService(params);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load orders.';
    return { success: false, error: message };
  }
}

/** `POST /api/v1/order-items` with JSON `{ productId, quantity }`. Used from product detail “Add to cart”. */
export async function createOrderItemAction(
  payload: OrderItemCreateRequest
): Promise<OrderActionResult<unknown>> {
  try {
    const data = await createOrderItemService(payload);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order item.';
    return { success: false, error: message };
  }
}

export async function getOrderItemAction(id: string): Promise<OrderActionResult<unknown>> {
  try {
    const data = await getOrderItemByIdService(id);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load order item.';
    return { success: false, error: message };
  }
}

export async function listOrderItemsAction(
  params?: OrderItemsListParams
): Promise<OrderActionResult<unknown>> {
  try {
    const data = await listOrderItemsService(params);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to list order items.';
    return { success: false, error: message };
  }
}

export async function updateOrderItemAction(
  id: string,
  payload: OrderItemUpdateRequest
): Promise<OrderActionResult<unknown>> {
  try {
    const data = await updateOrderItemService(id, payload);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update order item.';
    return { success: false, error: message };
  }
}

export async function deleteOrderItemAction(id: string): Promise<OrderActionResult<void>> {
  try {
    await deleteOrderItemService(id);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete order item.';
    return { success: false, error: message };
  }
}
