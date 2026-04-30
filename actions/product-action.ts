'use server';

import { getProductByIdService, getProductService } from '@/service/product-service';
import type {
  ApiProductItem,
  ProductListApiResponse,
  ProductListFilters,
  ProductDetailResult,
} from '@/types/product';

export type GetProductActionResult = {
  success: boolean;
  data?: ProductListApiResponse;
  error?: string;
};

export type GetProductByIdActionResult = {
  success: boolean;
  data?: ProductDetailResult;
  error?: string;
};

export async function getProductAction(
  page: number,
  size: number,
  filters?: ProductListFilters
): Promise<GetProductActionResult> {
  try {
    const data = await getProductService(page, size, filters);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load products.';
    if (process.env.NODE_ENV === 'development') {
      console.error('[getProductAction]', message);
    }
    return { success: false, error: message };
  }
}

export async function getProductByIdAction(
  id: string
): Promise<GetProductByIdActionResult> {
  try {
    const data = await getProductByIdService(id);
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load product.';
    if (process.env.NODE_ENV === 'development') {
      console.error('[getProductByIdAction]', message);
    }
    return { success: false, error: message };
  }
}
