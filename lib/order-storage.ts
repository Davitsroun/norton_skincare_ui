import type { CartItem } from '@/lib/cart-context';
import type { Order } from '@/lib/mock-data/types';

const ORDER_STORAGE_KEY = 'customer_order_history';

export interface CheckoutFormData {
  fullName: string;
  contactNumber: string;
  fulfillmentMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
}

const parseStoredOrders = (rawValue: string | null): Order[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getStoredOrders = (): Order[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  return parseStoredOrders(localStorage.getItem(ORDER_STORAGE_KEY));
};

export const saveOrderToHistory = (order: Order) => {
  if (typeof window === 'undefined') {
    return;
  }

  const existingOrders = getStoredOrders();
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([order, ...existingOrders]));
};

export const createOrderFromCart = (
  items: CartItem[],
  cartTotal: number,
  formData: CheckoutFormData
): Order => {
  const now = new Date();
  const orderSuffix = now.getTime().toString().slice(-6);

  return {
    id: `ORD-${orderSuffix}`,
    date: now.toISOString().split('T')[0],
    items: items.map((item) => ({
      id: item.productId,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    })),
    total: Number((cartTotal * 1.1).toFixed(2)),
    status: formData.fulfillmentMethod === 'delivery' ? 'pending' : 'completed',
    trackingNumber:
      formData.fulfillmentMethod === 'delivery' ? `TRK-${orderSuffix}` : undefined,
    fulfillmentMethod: formData.fulfillmentMethod,
    customerName: formData.fullName.trim(),
    contactNumber: formData.contactNumber.trim(),
    deliveryAddress:
      formData.fulfillmentMethod === 'delivery' ? formData.deliveryAddress?.trim() : undefined,
    paymentMethod:
      formData.fulfillmentMethod === 'pickup' ? 'khqr' : 'cash-on-delivery',
  };
};
