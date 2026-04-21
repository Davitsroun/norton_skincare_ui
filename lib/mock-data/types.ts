export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  badge?: string;
}

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
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
  verified?: boolean;
}
