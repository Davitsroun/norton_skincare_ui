/** Add favorite POST body */
export type FavoriteBrandCreateRequest = {
  brandId: string;
};

/** One row returned from GET favorite-brands (normalized for UI). */
export type FavoriteBrandListItem = {
  favoriteBrandId: string;
  brandId: string;
  /** Brand label from API (`brandName` / nested brand) */
  name?: string;
  /** Brand / logo image when distinct from catalog product hero */
  image?: string;
  /** Product teaser image — preferred for cards when returned by API (`imageUrl`) */
  imageUrl?: string;
  /** ISO-ish country tag when API sends it */
  country?: string;
  description?: string;
  productId?: string;
  productName?: string;
  price?: number;
};

export type FavoriteBrandListParams = {
  page?: number;
  size?: number;
};
