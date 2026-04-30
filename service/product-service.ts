import { getKeycloakToken } from '@/constant/token';
import { productRoute } from '@/route/product';
import type {
  ApiProductItem,
  ApiProductReview,
  ProductListApiResponse,
  ProductListFilters,
  ProductDetailResult,
} from '@/types/product';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/**
 * Supports `{ items, paginationResponse }` or Spring Page `{ content, number, size, totalElements, totalPages }`.
 */
export function normalizeProductListPayload(raw: unknown): ProductListApiResponse {
  if (!isRecord(raw)) {
    throw new Error('Product list response is not a JSON object');
  }

  if (Array.isArray(raw.items) && isRecord(raw.paginationResponse)) {
    return {
      items: raw.items as ApiProductItem[],
      paginationResponse:
        raw.paginationResponse as unknown as ProductListApiResponse['paginationResponse'],
    };
  }

  if (Array.isArray(raw.content)) {
    const content = raw.content as ApiProductItem[];
    const totalElements = typeof raw.totalElements === 'number' ? raw.totalElements : content.length;
    const size = typeof raw.size === 'number' && raw.size > 0 ? raw.size : content.length || 1;
    const totalPagesRaw = typeof raw.totalPages === 'number' ? raw.totalPages : undefined;
    const totalPages =
      totalPagesRaw !== undefined ? Math.max(1, totalPagesRaw) : Math.max(1, Math.ceil(totalElements / size));
    const currentPage = typeof raw.number === 'number' ? raw.number : 0;

    return {
      items: content,
      paginationResponse: {
        totalElements,
        currentPage,
        pageSize: size,
        totalPages,
      },
    };
  }

  throw new Error('Unexpected product list shape (expected items+paginationResponse or Spring page)');
}

/** Parses `GET .../products/:id` — `{ payload: { product, relateProduct, reviewver } }`, same fields at root, or legacy shapes. */
export function parseProductDetailResponse(raw: unknown): ProductDetailResult {
  if (!isRecord(raw)) {
    throw new Error('Product detail response is not a JSON object');
  }

  const inner = unpackProductDetailInner(raw);
  if (inner) {
    const built = bundleFromInner(inner);
    if (built) {
      return built;
    }
  }

  if (typeof raw.id === 'string' && typeof raw.name === 'string') {
    return { product: raw as unknown as ApiProductItem, relateProduct: [], reviews: [] };
  }

  const nested = raw.data;
  if (isRecord(nested) && typeof nested.id === 'string' && typeof nested.name === 'string') {
    return { product: nested as unknown as ApiProductItem, relateProduct: [], reviews: [] };
  }

  const standalone = raw.product;
  if (isRecord(standalone) && typeof standalone.id === 'string' && typeof standalone.name === 'string') {
    return {
      product: standalone as unknown as ApiProductItem,
      relateProduct: [],
      reviews: [],
    };
  }

  const items = raw.items;
  if (Array.isArray(items) && items.length > 0 && apiItemLooksValid(items[0])) {
    return { product: items[0] as ApiProductItem, relateProduct: [], reviews: [] };
  }

  throw new Error('Unexpected product detail shape');
}

function unpackProductDetailInner(raw: Record<string, unknown>): Record<string, unknown> | null {
  if (isRecord(raw.payload) && isRecord(raw.payload.product)) {
    return raw.payload as Record<string, unknown>;
  }

  if (isRecord(raw.product)) {
    const p = raw.product as Record<string, unknown>;
    if (typeof p.id === 'string' && typeof p.name === 'string') {
      return raw;
    }
  }

  return null;
}

function bundleFromInner(inner: Record<string, unknown>): ProductDetailResult | null {
  const apiProduct = inner.product;
  if (!isRecord(apiProduct) || typeof apiProduct.id !== 'string' || typeof apiProduct.name !== 'string') {
    return null;
  }

  const related =
    inner.relateProduct ?? inner.relatedProducts ?? inner.relatedProduct ?? [];
  const relateProduct = Array.isArray(related)
    ? (related as unknown[]).filter(apiItemLooksValid).map((row) => row as ApiProductItem)
    : [];

  const reviews = normalizeReviews(
    inner.reviewver ?? inner.reviewer ?? inner.reviews ?? []
  );

  return {
    product: apiProduct as unknown as ApiProductItem,
    relateProduct,
    reviews,
  };
}

function normalizeReviews(raw: unknown): ApiProductReview[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const out: ApiProductReview[] = [];
  for (const row of raw) {
    if (!isRecord(row)) {
      continue;
    }
    const id = row.id != null ? String(row.id) : '';
    if (!id) {
      continue;
    }

    const ratingRaw =
      typeof row.rating === 'number'
        ? row.rating
        : typeof row.rating === 'string'
          ? Number(row.rating)
          : NaN;
    const rating = Number.isFinite(ratingRaw)
      ? Math.min(5, Math.max(0, ratingRaw))
      : 0;

    out.push({
      id,
      userId: row.userId != null ? String(row.userId) : '',
      userName:
        row.userName === null || row.userName === undefined
          ? null
          : String(row.userName),
      userImageUrl:
        typeof row.userImageUrl === 'string' && row.userImageUrl.length > 0
          ? row.userImageUrl
          : row.userImageUrl === null || row.userImageUrl === undefined
            ? null
            : String(row.userImageUrl),
      productId: row.productId != null ? String(row.productId) : '',
      rating,
      comment: typeof row.comment === 'string' ? row.comment : '',
      createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
    });
  }

  return out;
}

function apiItemLooksValid(v: unknown): boolean {
  return isRecord(v) && typeof v.id === 'string' && typeof v.name === 'string';
}

/** Backend sometimes returns 200 with `{ error: string }` or `{ success: false, message }`. */
function throwIfApiErrorPayload(raw: unknown): void {
  if (!isRecord(raw)) {
    return;
  }
  if (typeof raw.error === 'string' && raw.error.trim() !== '') {
    throw new Error(raw.error);
  }
  if (raw.success === false) {
    const msg = typeof raw.message === 'string' ? raw.message : 'Request failed.';
    throw new Error(msg);
  }
}

async function readJsonOrEmpty(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

export async function getProductService(
  page: number,
  size: number,
  filters?: ProductListFilters
): Promise<ProductListApiResponse> {
  const url = productRoute.getProduct(page, size, filters);
  const token = await getKeycloakToken();

  const response = await fetch(url, {
    cache: 'no-store',
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const raw = await readJsonOrEmpty(response);
  throwIfApiErrorPayload(raw);

  if (!response.ok) {
    const hint =
      isRecord(raw) && typeof raw.error === 'string' ? raw.error : null;
    throw new Error(hint ?? `Products request failed (${response.status})`);
  }

  return normalizeProductListPayload(raw);
}

export async function getProductByIdService(id: string): Promise<ProductDetailResult> {
  const url = productRoute.getProductById(id);
  const token = await getKeycloakToken();

  const response = await fetch(url, {
    cache: 'no-store',
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  console.log('response', token);

  const raw = await readJsonOrEmpty(response);
  throwIfApiErrorPayload(raw);

  if (!response.ok) {
    const hint =
      isRecord(raw) && typeof raw.error === 'string' ? raw.error : null;
    throw new Error(hint ?? `Product by id request failed (${response.status})`);
  }

  return parseProductDetailResponse(raw);
}

