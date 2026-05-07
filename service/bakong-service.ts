import { getKeycloakToken } from '@/constant/token';
import { extractBakongGeneratePayload } from '@/lib/normalize-bakong';
import { bakongRoute } from '@/route/bakong';
import type {
  BakongCheckTransactionRequest,
  BakongGenerateQrRequest,
  BakongGetQrImageRequest,
} from '@/types/bakong';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function readJsonOrThrow(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text.trim()) {
    throw new Error(`HTTP ${response.status}`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(text.slice(0, 200));
  }
}

async function bearerHeaders(): Promise<HeadersInit> {
  const token = await getKeycloakToken();
  if (!token) {
    throw new Error('Sign in required.');
  }
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export type BakongGenerateResult = {
  raw: unknown;
  qr: string | null;
  md5: string | null;
};

export async function bakongGenerateQrService(body: BakongGenerateQrRequest): Promise<BakongGenerateResult> {
  const response = await fetch(bakongRoute.generateQr(), {
    method: 'POST',
    cache: 'no-store',
    headers: await bearerHeaders(),
    body: JSON.stringify(body),
  });

  const raw = await readJsonOrThrow(response);

  if (!response.ok) {
    const msg =
      isRecord(raw) && typeof raw.message === 'string' ? raw.message : `Generate QR failed (${response.status})`;
    throw new Error(msg);
  }

  const extracted = extractBakongGeneratePayload(raw);
  return { raw, ...extracted };
}

/** Returns a data URL suitable for `<img src={…} />`. */
export async function bakongGetQrImageService(payload: BakongGetQrImageRequest): Promise<string> {
  const response = await fetch(bakongRoute.getQrImage(), {
    method: 'POST',
    cache: 'no-store',
    headers: await bearerHeaders(),
    body: JSON.stringify(payload),
  });

  const ct = response.headers.get('content-type') ?? '';

  if (ct.includes('image/')) {
    const buf = Buffer.from(await response.arrayBuffer());
    if (!response.ok) {
      throw new Error(buf.toString('utf8').slice(0, 200) || `Get QR image failed (${response.status})`);
    }
    return `data:${ct};base64,${buf.toString('base64')}`;
  }

  const raw = await readJsonOrThrow(response).catch(async () => {
    const buf = Buffer.from(await response.arrayBuffer()).toString('utf8').slice(0, 400);
    throw new Error(response.ok ? buf : `${response.status}: ${buf}`);
  });

  if (!response.ok) {
    const msg = isRecord(raw) && typeof raw.message === 'string' ? raw.message : `Get QR image failed (${response.status})`;
    throw new Error(msg);
  }

  function dataUrlFromBase64(part: unknown, mime: string): string | null {
    if (typeof part !== 'string' || part.trim() === '') {
      return null;
    }
    const b = part.includes('data:image') ? part : `data:${mime};base64,${part.trim()}`;
    return b;
  }

  if (!isRecord(raw)) {
    throw new Error('Unexpected get-qr-image response shape.');
  }

  const mime =
    (typeof raw.contentType === 'string' && raw.contentType.includes('/')
      ? raw.contentType
      : 'image/png') as string;

  const directUrl =
    typeof raw.url === 'string'
      ? raw.url
      : typeof raw.imageUrl === 'string'
        ? raw.imageUrl
        : null;
  if (directUrl?.startsWith('http')) {
    return directUrl;
  }

  const fromData =
    dataUrlFromBase64(raw.imageBase64 ?? raw.image, mime) ??
    dataUrlFromBase64(raw.base64 ?? raw.data, mime) ??
    null;

  if (fromData) {
    return fromData;
  }

  const nested = raw.payload ?? raw.data;
  if (isRecord(nested)) {
    const nestedMime =
      (typeof nested.contentType === 'string' ? nested.contentType : mime) as string;
    const nu =
      dataUrlFromBase64(nested.imageBase64 ?? nested.image ?? nested.data, nestedMime) ??
      null;
    if (nu) {
      return nu;
    }
    if (typeof nested.url === 'string' && nested.url.startsWith('http')) {
      return nested.url;
    }
  }

  throw new Error('Could not read QR image from API response.');
}

export async function bakongCheckTransactionService(body: BakongCheckTransactionRequest): Promise<unknown> {
  const response = await fetch(bakongRoute.checkTransaction(), {
    method: 'POST',
    cache: 'no-store',
    headers: await bearerHeaders(),
    body: JSON.stringify(body),
  });

  let raw: unknown;
  try {
    raw = await readJsonOrThrow(response);
  } catch {
    const t = await response.text().catch(() => '');
    throw new Error(!response.ok ? `${response.status}: ${t.slice(0, 240)}` : t);
  }

  if (!response.ok) {
    const msg = isRecord(raw) && typeof raw.message === 'string' ? raw.message : JSON.stringify(raw);
    throw new Error(msg);
  }

  return raw;
}
