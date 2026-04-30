import { getKeycloakToken } from '@/constant/token';
import { reviewRoute } from '@/route/review';
import type { ReviewViewResponse } from '@/types/product';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** API returns `{ success, message?, payload? }`; throws with `message` or status. */
function reviewEnvelope(res: Response, raw: unknown): ReviewViewResponse {
  const env = isRecord(raw) ? raw : {};
  if (!res.ok || env.success === false) {
    const msg =
      typeof env.message === 'string'
        ? env.message
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const p = env.payload;
  if (!isRecord(p) || typeof p.id !== 'string' || typeof p.userId !== 'string') {
    throw new Error(
      typeof env.message === 'string' ? env.message : 'Unexpected review response'
    );
  }
  return p as unknown as ReviewViewResponse;
}

export async function createReviewService(body: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<ReviewViewResponse> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(reviewRoute.reviews, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: body.productId,
      rating: body.rating,
      comment: body.comment,
    }),
  });

  const raw: unknown = await response.json().catch(() => ({}));
  return reviewEnvelope(response, raw);
}

export async function updateReviewService(
  id: string,
  body: { rating?: number; comment?: string }
): Promise<ReviewViewResponse> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const payload: Record<string, unknown> = {};
  if (body.rating !== undefined) {
    payload.rating = body.rating;
  }
  if (body.comment !== undefined) {
    payload.comment = body.comment;
  }

  const response = await fetch(reviewRoute.reviewById(id), {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const raw: unknown = await response.json().catch(() => ({}));
  return reviewEnvelope(response, raw);
}

export async function deleteReviewService(id: string): Promise<void> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(reviewRoute.reviewById(id), {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  let raw: unknown = {};
  if (text.trim()) {
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      raw = {};
    }
  }

  const env = isRecord(raw) ? raw : {};
  if (!response.ok || env.success === false) {
    const msg =
      typeof env.message === 'string'
        ? env.message
        : `Delete failed (${response.status})`;
    throw new Error(msg);
  }
}
