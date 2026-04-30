import type { Order } from '@/types/order';

/** Best-effort: copy server-returned id/total/status into local order saved for `/history`. */
export function enrichLocalOrderWithApiResponse(api: unknown, local: Order): Order {
  if (api === null || typeof api !== 'object') {
    return local;
  }

  const o = api as Record<string, unknown>;
  const next: Order = { ...local };

  const rawId = o.id ?? o.orderId;
  if (typeof rawId === 'string' && rawId.length > 0) {
    next.id = rawId;
  } else if (typeof rawId === 'number') {
    next.id = String(rawId);
  }

  const rawTotal =
    typeof o.total === 'number'
      ? o.total
      : typeof o.orderTotal === 'number'
        ? o.orderTotal
        : typeof o.amount === 'number'
          ? o.amount
          : null;
  if (rawTotal !== null && Number.isFinite(rawTotal)) {
    next.total = rawTotal;
  }

  const status = o.status ?? o.orderStatus;
  if (typeof status === 'string' && status.length > 0) {
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'completed' || s === 'shipped' || s === 'cancelled') {
      next.status = s as Order['status'];
    }
  }

  const tracking =
    typeof o.trackingNumber === 'string'
      ? o.trackingNumber
      : typeof o.tracking === 'string'
        ? o.tracking
        : undefined;
  if (tracking) {
    next.trackingNumber = tracking;
  }

  return next;
}
