import { getKeycloakToken } from '@/constant/token';
import { normalizeOrdersPayload } from '@/lib/normalize-history-orders';
import { orderItemRoute, orderRoute } from '@/route/order';
import type {
  CreateOrderRequest,
  OrderItemCreateRequest,
  OrderItemUpdateRequest,
  OrderItemsListParams,
  OrderListParams,
} from '@/types/order-api';
import type { Order } from '@/types/order';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export async function createOrderService(payload: CreateOrderRequest): Promise<unknown> {
  const url = orderRoute.orders();
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required to place an order.');
  }

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Checkout request failed (${response.status})`);
  }

  const text = await response.text();
  return text.trim() ? (JSON.parse(text) as unknown) : null;
}

export async function listOrdersService(params?: OrderListParams): Promise<Order[]> {
  const url = orderRoute.ordersList(params);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Orders request failed (${response.status})`);
  }

  const raw: unknown = await response.json();
  if (isRecord(raw) && raw.success === false) {
    const msg = typeof raw.message === 'string' ? raw.message : 'Orders request failed.';
    throw new Error(msg);
  }

  return normalizeOrdersPayload(raw);
}

export async function createOrderItemService(body: OrderItemCreateRequest): Promise<unknown> {
  const url = orderItemRoute.collection();
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Create order item failed (${response.status})`);
  }

  const text = await response.text();
  return text.trim() ? (JSON.parse(text) as unknown) : null;
}

export async function getOrderItemByIdService(id: string): Promise<unknown> {
  const url = orderItemRoute.byId(id);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Order item request failed (${response.status})`);
  }

  const raw: unknown = await response.json();
  return raw;
}

export async function listOrderItemsService(params?: OrderItemsListParams): Promise<unknown> {
  const url = orderItemRoute.collection(params);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Order items list failed (${response.status})`);
  }

  const raw: unknown = await response.json();
  return raw;
}

export async function updateOrderItemService(
  id: string,
  body: OrderItemUpdateRequest
): Promise<unknown> {
  const url = orderItemRoute.byId(id);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Update order item failed (${response.status})`);
  }

  const text = await response.text();
  return text.trim() ? (JSON.parse(text) as unknown) : null;
}

export async function deleteOrderItemService(id: string): Promise<void> {
  const url = orderItemRoute.byId(id);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete order item failed (${response.status})`);
  }
}
