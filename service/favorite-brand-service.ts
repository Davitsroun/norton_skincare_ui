import { getKeycloakToken } from '@/constant/token';
import {
  favoriteBrandRouteById,
  favoriteBrandRouteCollection,
  favoriteBrandRouteList,
} from '@/route/favorite-brand';
import { normalizeFavoriteBrandsPayload } from '@/lib/normalize-favorite-brands';
import type { FavoriteBrandCreateRequest, FavoriteBrandListItem, FavoriteBrandListParams } from '@/types/favorite-brand';

export async function listFavoriteBrandsService(
  params?: FavoriteBrandListParams
): Promise<FavoriteBrandListItem[]> {
  const url = favoriteBrandRouteList(params?.page ?? 0, params?.size ?? 50);
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
    const text = await response.text().catch(() => '');
    throw new Error(text || `Favorites request failed (${response.status})`);
  }

  const raw: unknown = await response.json().catch(() => ({}));
  return normalizeFavoriteBrandsPayload(raw);
}

export async function addFavoriteBrandService(body: FavoriteBrandCreateRequest): Promise<void> {
  const url = favoriteBrandRouteCollection();
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }
  console.log('body', token);

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ brandId: body.brandId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Add favorite failed (${response.status})`);
  }
}

export async function deleteFavoriteBrandService(favoriteBrandId: string): Promise<void> {
  const url = favoriteBrandRouteById(favoriteBrandId);
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
    const text = await response.text().catch(() => '');
    throw new Error(text || `Remove favorite failed (${response.status})`);
  }
}
