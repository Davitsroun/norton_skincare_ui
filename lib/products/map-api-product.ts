import { ApiProductItem } from "@/types/product";
import { Product } from "../mock-data";
import { normalizeProductCategoryKey } from "@/lib/mock-data/shop";

/** Map catalog API row to UI `Product`; collect distinct gallery images when present */
export function mapApiProductItemToUi(p: ApiProductItem): { product: Product; galleryUrls: string[] } {
  const product: Product = {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    category: normalizeProductCategoryKey(p.category),
    description: p.description,
    badge: p.badge ?? undefined,
  };

  const galleryUrls = [p.image, p.imageUrl2, p.imageUrl3, p.imageUrl4]
    .filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

  return { product, galleryUrls: [...new Set(galleryUrls)] };
}
