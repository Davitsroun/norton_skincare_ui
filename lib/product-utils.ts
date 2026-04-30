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

/** API catalog row → shop UI shape */
export function apiItemToProduct(item: ApiProductItem): Product {
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
