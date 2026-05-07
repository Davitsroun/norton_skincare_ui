import type { FavoriteBrandListItem } from '@/types/favorite-brand';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) {
      return c.trim();
    }
  }
  return undefined;
}

function pickNumber(...candidates: unknown[]): number | undefined {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) {
      return c;
    }
    if (typeof c === 'string' && c.trim() !== '') {
      const n = Number(c);
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return undefined;
}

/**
 * Normalize one favorite-brand row from common API shapes:
 * `{ id, brandId }`, `{ favoriteBrandId, brandId }`, `{ id, brand: { id, name } }`, etc.
 */
export function normalizeFavoriteBrandRow(raw: unknown): FavoriteBrandListItem | null {
  if (!isRecord(raw)) {
    return null;
  }

  const brandNested = isRecord(raw.brand) ? raw.brand : null;
  const productNested = isRecord(raw.product) ? raw.product : null;

  const brandId = pickString(
    raw.brandId,
    raw.brand_id,
    brandNested?.id,
    brandNested?.brandId,
  );

  const favoriteBrandId = pickString(
    raw.favoriteBrandId,
    raw.favorite_brand_id,
    raw.id,
    raw.favoriteId,
    raw.favorite_id,
  );

  if (!brandId || !favoriteBrandId) {
    return null;
  }

  const name = pickString(
    raw.brandName,
    raw.name,
    brandNested?.name,
    brandNested?.brandName,
  );

  const country = pickString(raw.country, brandNested?.country);

  const imageUrl = pickString(
    raw.imageUrl,
    raw.image_url,
    productNested?.imageUrl,
    productNested?.image_url,
    productNested?.image,
    productNested?.thumbnailUrl,
    productNested?.thumbnail_url,
  );

  const image = pickString(raw.image, brandNested?.image, brandNested?.logoUrl, brandNested?.logo_url);

  const description =
    typeof raw.description === 'string'
      ? raw.description
      : typeof brandNested?.description === 'string'
        ? brandNested.description
        : typeof productNested?.description === 'string'
          ? productNested.description
          : undefined;

  const productId = pickString(raw.productId, raw.product_id, productNested?.id);

  const productName = pickString(raw.productName, raw.product_name, productNested?.name);

  const price = pickNumber(productNested?.price, raw.price, raw.productPrice, raw.product_price);

  return {
    favoriteBrandId,
    brandId,
    name,
    country,
    imageUrl,
    image,
    description,
    productId,
    productName,
    price,
  };
}

export function normalizeFavoriteBrandsPayload(raw: unknown): FavoriteBrandListItem[] {
  let rows: unknown[] = [];

  if (Array.isArray(raw)) {
    rows = raw;
  } else if (isRecord(raw)) {
    const payload = isRecord(raw.payload) ? raw.payload : null;
    if (payload && Array.isArray(payload.items)) {
      rows = payload.items;
    } else if (Array.isArray(raw.content)) {
      rows = raw.content;
    } else if (Array.isArray(raw.items)) {
      rows = raw.items;
    } else if (Array.isArray(raw.data)) {
      rows = raw.data;
    } else if (Array.isArray(raw.payload)) {
      rows = raw.payload;
    }
  }

  const out: FavoriteBrandListItem[] = [];
  for (const row of rows) {
    const item = normalizeFavoriteBrandRow(row);
    if (item) {
      out.push(item);
    }
  }

  return out;
}
