/** Parse id from POST/PUT payment-profile JSON envelopes. */
export function extractPaymentProfileId(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, unknown>;

  const fromObj = (o: Record<string, unknown>): string | undefined => {
    const candidates = [o.id, o.paymentProfileId, o.payment_profile_id];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) {
        return c.trim();
      }
    }
    return undefined;
  };

  const top = fromObj(r);
  if (top) {
    return top;
  }

  const payload = r.payload;
  if (payload && typeof payload === 'object' && payload !== null) {
    const inner = fromObj(payload as Record<string, unknown>);
    if (inner) {
      return inner;
    }
  }

  return null;
}
