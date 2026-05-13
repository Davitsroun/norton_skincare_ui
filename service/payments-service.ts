import { getKeycloakToken } from '@/constant/token';
import { paymentsRouteById, paymentsRouteCollection } from '@/route/payments';
import type { CreatePaymentRequest, UpdatePaymentRequest } from '@/types/payments-api';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

export async function createPaymentService(body: CreatePaymentRequest): Promise<unknown> {
  const url = paymentsRouteCollection();
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let raw: unknown = null;
  if (text.trim()) {
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      raw = text;
    }
  }

  if (!response.ok) {
    const msg =
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : text || `Create payment failed (${response.status})`;
    throw new Error(msg);
  }

  if (isRecord(raw) && raw.success === false) {
    const msg = typeof raw.message === 'string' ? raw.message : 'Create payment rejected.';
    throw new Error(msg);
  }

  return raw;
}

export async function updatePaymentService(
  paymentId: string,
  body: UpdatePaymentRequest
): Promise<unknown> {
  const url = paymentsRouteById(paymentId);
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }

  const response = await fetch(url, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let raw: unknown = null;
  if (text.trim()) {
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      raw = text;
    }
  }

  if (!response.ok) {
    const msg =
      isRecord(raw) && typeof raw.message === 'string'
        ? raw.message
        : text || `Update payment failed (${response.status})`;
    throw new Error(msg);
  }

  if (isRecord(raw) && raw.success === false) {
    const msg = typeof raw.message === 'string' ? raw.message : 'Update payment rejected.';
    throw new Error(msg);
  }

  return raw;
}
