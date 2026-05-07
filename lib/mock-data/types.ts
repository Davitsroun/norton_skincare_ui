export type { Order, OrderItem } from '@/types/order';

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
  /** Brand UUID from catalog — required for favorite-brands API */
  brandId?: string;
  brandName?: string;
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
