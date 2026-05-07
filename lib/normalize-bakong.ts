function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function trimString(v: unknown): string | null {
  if (typeof v !== 'string') {
    return null;
  }
  const t = v.trim();
  return t !== '' ? t : null;
}

/**
 * Parses EMV QR string + md5 fingerprint from Bakong generate-qr payloads.
 */
export function extractBakongGeneratePayload(raw: unknown): { qr: string | null; md5: string | null } {
  if (!raw || typeof raw !== 'object') {
    return { qr: null, md5: null };
  }

  const r = raw as Record<string, unknown>;
  const inner = r.payload ?? r.data;
  let innerRec: Record<string, unknown> | null = null;
  if (isRecord(inner)) {
    innerRec = inner;
  }

  let qr: string | null =
    trimString(r.qr) ??
    trimString(r.dataQr) ??
    (innerRec ? trimString(innerRec.qr) : null);

  /** Some APIs nest `data.qr`, `payload.data.qr` */
  if (!qr && isRecord(inner) && typeof inner.qr !== 'string' && inner.data !== undefined) {
    const dd = inner.data;
    qr = trimString(dd);
    if (!qr && isRecord(dd)) {
      qr = trimString(dd.qr);
    }
  }

  const md5: string | null =
    trimString(r.md5) ??
    trimString(r.MD5) ??
    trimString(r.md5Hash) ??
    (innerRec ? trimString(innerRec.md5) : null);

  return { qr, md5 };
}
