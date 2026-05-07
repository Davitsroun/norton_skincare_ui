import { getKeycloakToken } from '@/constant/token';
import { extractPaymentProfileId } from '@/lib/extract-payment-profile-id';
import { paymentProfileRoute } from '@/route/payment-profile';
import type { PaymentProfileUpsertBody } from '@/types/payment-profile';

export type PaymentProfileMutationResult = {
  raw: unknown;
  paymentProfileId: string | null;
};

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function createPaymentProfileService(
  body: PaymentProfileUpsertBody
): Promise<PaymentProfileMutationResult> {
  const url = paymentProfileRoute.collection();
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

  const raw = await parseJsonSafe(response);

  if (!response.ok) {
    const msg =
      typeof raw === 'object' &&
      raw !== null &&
      typeof (raw as Record<string, unknown>).message === 'string'
        ? ((raw as Record<string, unknown>).message as string)
        : typeof raw === 'string'
          ? raw
          : `Create payment profile failed (${response.status})`;
    throw new Error(msg);
  }

  return { raw, paymentProfileId: extractPaymentProfileId(raw) };
}

export async function updatePaymentProfileService(
  id: string,
  body: PaymentProfileUpsertBody
): Promise<PaymentProfileMutationResult> {
  const url = paymentProfileRoute.byId(id);
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

  const raw = await parseJsonSafe(response);

  if (!response.ok) {
    const msg =
      typeof raw === 'object' &&
      raw !== null &&
      typeof (raw as Record<string, unknown>).message === 'string'
        ? ((raw as Record<string, unknown>).message as string)
        : typeof raw === 'string'
          ? raw
          : `Update payment profile failed (${response.status})`;
    throw new Error(msg);
  }

  return {
    raw,
    paymentProfileId: extractPaymentProfileId(raw) ?? id,
  };
}

export async function deletePaymentProfileService(id: string): Promise<void> {
  const url = paymentProfileRoute.byId(id);
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
    throw new Error(text.trim() || `Delete payment profile failed (${response.status})`);
  }
}
