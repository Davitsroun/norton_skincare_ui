/** Canonical order shapes for UI and API normalization (avoid coupling to mock seed data). */

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'completed' | 'pending' | 'shipped' | 'cancelled';
  trackingNumber?: string;
  fulfillmentMethod?: 'pickup' | 'delivery';
  customerName?: string;
  contactNumber?: string;
  deliveryAddress?: string;
  paymentMethod?: 'khqr' | 'cash-on-delivery';
}
