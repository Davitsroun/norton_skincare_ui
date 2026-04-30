import { getKeycloakToken } from '@/constant/token';
import { reviewRoute } from '@/route/review';
import type { ReviewViewResponse } from '@/types/product';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  payload?: T | null;
};

function assertReviewPayload(p: unknown): ReviewViewResponse {
  if (!isRecord(p) || typeof p.id !== 'string' || typeof p.userId !== 'string') {
    throw new Error('Unexpected review response shape');
  }
  return p as unknown as ReviewViewResponse;
}

async function parseReviewMutationResponse(res: Response): Promise<ReviewViewResponse> {
  const raw: unknown = await res.json().catch(() => ({}));
  const env = raw as ApiEnvelope<ReviewViewResponse>;

  if (!res.ok || env.success === false) {
    const msg = typeof env.message === 'string' ? env.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (env.payload == null) {
    throw new Error(typeof env.message === 'string' ? env.message : 'Empty review payload');
  }

  return assertReviewPayload(env.payload);
}

function authHeaders(token: string | null): Record<string, string> {
  const h: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

export async function createReviewService(body: {
  productId: string;
  rating: number;
  comment: string;
}): Promise<ReviewViewResponse> {
  const token = await getKeycloakToken();
  const res = await fetch(reviewRoute.reviews, {
    method: 'POST',
    cache: 'no-store',
    headers: authHeaders(token),
    body: JSON.stringify({
      productId: body.productId,
      rating: body.rating,
      comment: body.comment,
    }),
  });
  return parseReviewMutationResponse(res);
}

export async function updateReviewService(
  id: string,
  body: { rating?: number; comment?: string }
): Promise<ReviewViewResponse> {
  const token = await getKeycloakToken();
  const payload: Record<string, unknown> = {};
  if (body.rating !== undefined) {
    payload.rating = body.rating;
  }
  if (body.comment !== undefined) {
    payload.comment = body.comment;
  }

  const res = await fetch(reviewRoute.reviewById(id), {
    method: 'PUT',
    cache: 'no-store',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseReviewMutationResponse(res);
}

export async function deleteReviewService(id: string): Promise<void> {
  const token = await getKeycloakToken();
  const res = await fetch(reviewRoute.reviewById(id), {
    method: 'DELETE',
    cache: 'no-store',
    headers: authHeaders(token),
  });

  const text = await res.text();
  let env: ApiEnvelope<null> = {};
  if (text) {
    try {
      env = JSON.parse(text) as ApiEnvelope<null>;
    } catch {
      /* ignore */
    }
  }

  if (!res.ok || env.success === false) {
    const msg = typeof env.message === 'string' ? env.message : `Delete failed (${res.status})`;
    throw new Error(msg);
  }
}
