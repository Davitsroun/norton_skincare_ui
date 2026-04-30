/** Query params for `productRoute.getProduct` */
export type ProductListFilters = {
  minPrice?: number;
  maxPrice?: number;
};

/** One product row from `GET .../products` paginated API */
export interface ApiProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  imageUrl2: string;
  imageUrl3: string;
  imageUrl4: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  badge: string | null;
}

export interface ProductPaginationResponse {
  totalElements: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/** Full JSON body shape for paginated products list */
export interface ProductListApiResponse {
  items: ApiProductItem[];
  paginationResponse: ProductPaginationResponse;
}

/** One review (list on product detail or mutation payload). */
export interface ReviewViewResponse {
  id: string;
  userId: string;
  userName?: string | null;
  userImageUrl?: string | null;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/** Alias for reviews embedded on product detail (`reviewver`). */
export type ApiProductReview = ReviewViewResponse;

/** `GET /products/:id` normalized body */
export type ProductDetailResult = {
  product: ApiProductItem;
  relateProduct: ApiProductItem[];
  reviews: ApiProductReview[];
};

/** Optional API wrapper (your backend) */
export interface ProductDetailApiEnvelope {
  success?: boolean;
  message?: string;
  status?: string;
  payload?: {
    product?: ApiProductItem;
    relateProduct?: ApiProductItem[];
    relatedProducts?: ApiProductItem[];
    reviewver?: ApiProductReview[];
  };
  timestamps?: string;
}
