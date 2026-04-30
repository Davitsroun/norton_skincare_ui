import { apiBaseUrl } from '@/constant/baseurl';
import type { ProductListFilters } from '@/types/product';

export const productRoute = {
  getProduct: (page: number, size: number, filters?: ProductListFilters): string => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));

    if (filters?.minPrice !== undefined) {
      params.set('minPrice', String(filters.minPrice));
    }
    if (filters?.maxPrice !== undefined) {
      params.set('maxPrice', String(filters.maxPrice));
    }

    return `${apiBaseUrl.baseUrl}/api/v1/products?${params.toString()}`;
  },

  getProductById: (id: string): string =>
    `${apiBaseUrl.baseUrl}/api/v1/products/${encodeURIComponent(id)}`,
};
