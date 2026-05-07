import type { Product } from '@/lib/mock-data/types';
import type { ApiProductItem, ApiProductReview, ReviewViewResponse } from '@/types/product';
import { normalizeProductCategoryKey } from '@/lib/mock-data/shop';

/** Review row for product detail UI */
export type ProductReviewDisplay = {
  id: string;
  userId: string;
  author: string;
  avatarUrl?: string | null;
  dateLabel: string;
  rating: number;
  text: string;
};

function trimStr(v: unknown): string | undefined {
  if (typeof v !== 'string') {
    return undefined;
  }
  const t = v.trim();
  return t !== '' ? t : undefined;
}

/** Resolve brand id/name from flat fields, nested `brand`, or snake_case keys. */
export function resolveBrandFromApiItem(item: ApiProductItem): {
  brandId?: string;
  brandName?: string;
} {
  const rec = item as ApiProductItem & Record<string, unknown>;
  const nested = item.brand;
  const flatId = trimStr(item.brandId) ?? trimStr(rec.brand_id);
  const nestedId =
    nested && typeof nested === 'object' && nested !== null
      ? trimStr((nested as { id?: unknown }).id)
      : undefined;
  const brandId = flatId ?? nestedId;

  const flatName = trimStr(item.brandName) ?? trimStr(rec.brand_name);
  const nestedName =
    nested && typeof nested === 'object' && nested !== null
      ? trimStr((nested as { name?: unknown }).name)
      : undefined;
  const brandName = flatName ?? nestedName;

  return { brandId, brandName };
}

/** API catalog row → shop UI shape */
export function apiItemToProduct(item: ApiProductItem): Product {
  const { brandId, brandName } = resolveBrandFromApiItem(item);
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    originalPrice: item.originalPrice ?? undefined,
    image: item.image,
    rating: item.rating,
    reviews: item.reviews,
    category: normalizeProductCategoryKey(item.category),
    description: item.description,
    badge: item.badge ?? undefined,
    brandId,
    brandName,
  };
}

export function apiItemGalleryUrls(item: ApiProductItem): string[] {
  const urls = [item.image, item.imageUrl2, item.imageUrl3, item.imageUrl4].filter(
    (url) => typeof url === 'string' && url.trim() !== ''
  );
  return [...new Set(urls)];
}

function formatReviewDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function reviewToDisplayRow(r: ApiProductReview | ReviewViewResponse): ProductReviewDisplay {
  const name =
    r.userName != null && String(r.userName).trim().length > 0
      ? String(r.userName).trim()
      : r.userId.trim().length > 0
        ? r.userId
        : 'Customer';

  return {
    id: r.id,
    userId: r.userId,
    author: name,
    avatarUrl: r.userImageUrl,
    dateLabel: formatReviewDate(r.createdAt),
    rating: r.rating,
    text: r.comment,
  };
}

/** Review on product detail (`reviewver`) → card */
export function apiReviewToDisplay(r: ApiProductReview): ProductReviewDisplay {
  return reviewToDisplayRow(r);
}

/** POST/PUT review response → card */
export function reviewViewToDisplay(v: ReviewViewResponse): ProductReviewDisplay {
  return reviewToDisplayRow(v);
}
