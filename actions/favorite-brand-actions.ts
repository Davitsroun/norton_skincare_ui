'use server';

import {
  addFavoriteBrandService,
  deleteFavoriteBrandService,
  listFavoriteBrandsService,
} from '@/service/favorite-brand-service';
import type {
  FavoriteBrandCreateRequest,
  FavoriteBrandListItem,
  FavoriteBrandListParams,
} from '@/types/favorite-brand';

export type FavoriteBrandActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function listFavoriteBrandsAction(
  params?: FavoriteBrandListParams
): Promise<FavoriteBrandActionResult<FavoriteBrandListItem[]>> {
  try {
    const data = await listFavoriteBrandsService(params);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load favorites.';
    return { success: false, error: message };
  }
}

export async function addFavoriteBrandAction(
  payload: FavoriteBrandCreateRequest
): Promise<FavoriteBrandActionResult<void>> {
  try {
    await addFavoriteBrandService(payload);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to add favorite.';
    return { success: false, error: message };
  }
}

export async function deleteFavoriteBrandAction(
  favoriteBrandId: string
): Promise<FavoriteBrandActionResult<void>> {
  try {
    await deleteFavoriteBrandService(favoriteBrandId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to remove favorite.';
    return { success: false, error: message };
  }
}
