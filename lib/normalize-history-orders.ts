import type { Order, OrderItem } from '@/types/order';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function coerceNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Map API enums / strings → UI status */
export function normalizeOrderStatus(raw: unknown): Order['status'] {
  const t = String(raw ?? '')
    .toLowerCase()
    .replace(/\s+/g, '');

  if (t.includes('complete') || t.includes('paid') || t.includes('done')) {
    return 'completed';
  }
  if (t.includes('ship') || t.includes('dispatch') || t.includes('transit')) {
    return 'shipped';
  }
  if (t.includes('cancel')) {
    return 'cancelled';
  }
  if (t.includes('pend') || t.includes('process') || t.includes('new')) {
    return 'pending';
  }
  return 'pending';
}

/** Format ISO or date-ish string to yyyy-mm-dd for display */
export function coerceOrderDate(raw: unknown): string {
  const s =
    typeof raw === 'string' && raw.length > 0
      ? raw
      : raw instanceof Date
        ? raw.toISOString()
        : '';
  if (!s) {
    return new Date().toISOString().slice(0, 10);
  }
  try {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    /* ignore */
  }
  return s.slice(0, 10);
}

function mapLineItem(line: Record<string, unknown>): OrderItem | null {
  const qty = coerceNumber(line.quantity ?? line.qty);
  const priceCandidate =
    coerceNumber(line.unitPrice ?? line.price) ??
    coerceNumber(line.lineTotal) ??
    coerceNumber(line.subtotal);

  const product =
    isRecord(line.product) ? line.product :
    isRecord(line.productDTO) ? line.productDTO :
    null;

  const productName =
    typeof line.productName === 'string'
      ? line.productName
      : product && typeof product.name === 'string'
        ? product.name
        : typeof line.name === 'string'
          ? line.name
          : '';

  if (!productName || qty === null || priceCandidate === null) {
    return null;
  }

  const quantity = Math.max(1, Math.floor(qty));
  let unitPrice = priceCandidate;
  if (line.lineTotal != null || line.subtotal != null) {
    const lt = coerceNumber(line.lineTotal ?? line.subtotal);
    if (lt !== null && quantity > 0) {
      unitPrice = lt / quantity;
    }
  }

  const imageCandidate =
    typeof line.imageUrl === 'string'
      ? line.imageUrl
      : typeof line.image === 'string'
        ? line.image
        : product &&
            typeof (product.imageUrl ?? product.image ?? product.coverImage) === 'string'
          ? String(product.imageUrl ?? product.image ?? product.coverImage)
          : '';

  const id =
    line.id != null
      ? String(line.id)
      : line.orderItemId != null
        ? String(line.orderItemId)
        : product && product.productId != null
          ? String(product.productId)
          : `line-${productName}-${quantity}-${unitPrice}`;

  return {
    id,
    productName,
    quantity,
    price: Math.round(unitPrice * 100) / 100,
    image:
      typeof imageCandidate === 'string' && imageCandidate.length > 0 ? imageCandidate : '/placeholder.svg',
  };
}

/** One API order → UI `Order` or null */
export function normalizeOneOrder(raw: unknown): Order | null {
  if (!isRecord(raw)) {
    return null;
  }

  const idRaw = raw.id ?? raw.orderId;
  const id =
    idRaw !== null && idRaw !== undefined
      ? typeof idRaw === 'string'
        ? idRaw
        : typeof idRaw === 'number'
          ? String(idRaw)
          : null
      : null;
  if (!id) {
    return null;
  }

  const linesRaw =
    Array.isArray(raw.items) ? raw.items
    : Array.isArray(raw.orderItems) ? raw.orderItems
    : Array.isArray(raw.lines) ? raw.lines
    : [];

  const items = linesRaw
    .filter(isRecord)
    .map(mapLineItem)
    .filter((x): x is OrderItem => x !== null);

  const totalFallback = coerceNumber(raw.total ?? raw.orderTotal ?? raw.grandTotal ?? raw.amount) ?? 0;

  const totalFromLines =
    items.length > 0 ? items.reduce((s, li) => s + li.price * li.quantity, 0) : 0;
  const total =
    totalFromLines > 0
      ? Math.round(totalFromLines * 100) / 100
      : Math.round(totalFallback * 100) / 100;

  const date = coerceOrderDate(raw.createdAt ?? raw.orderDate ?? raw.date ?? raw.placedAt);

  const fulfillmentRaw =
    typeof raw.fulfillmentMethod === 'string'
      ? raw.fulfillmentMethod
      : typeof raw.fulfillment === 'string'
        ? raw.fulfillment
        : '';
  const fulfillment =
    fulfillmentRaw !== ''
      ? fulfillmentRaw.toLowerCase() === 'pickup'
        ? 'pickup'
        : 'delivery'
      : undefined;

  const paymentRaw = typeof raw.paymentMethod === 'string' ? raw.paymentMethod.toLowerCase().replace(/\s+/g, '') : '';
  const paymentMethod: Order['paymentMethod'] =
    paymentRaw.includes('khqr') ? 'khqr'
    : paymentRaw.includes('delivery') ? 'cash-on-delivery'
    : fulfillment === 'pickup' ? 'khqr'
    : 'cash-on-delivery';

  const order: Order = {
    id,
    date,
    items: items.length > 0 ? items : [],
    total,
    status: normalizeOrderStatus(raw.status ?? raw.orderStatus ?? raw.state),
    trackingNumber:
      typeof raw.trackingNumber === 'string' && raw.trackingNumber.length > 0
        ? raw.trackingNumber
        : typeof raw.tracking === 'string'
          ? raw.tracking
          : undefined,
    fulfillmentMethod:
      fulfillment === 'pickup' || fulfillment === 'delivery' ? fulfillment : undefined,
    customerName:
      typeof raw.customerName === 'string'
        ? raw.customerName
        : typeof raw.fullName === 'string'
          ? raw.fullName
          : undefined,
    contactNumber:
      typeof raw.contactNumber === 'string'
        ? raw.contactNumber
        : typeof raw.phone === 'string'
          ? raw.phone
          : undefined,
    deliveryAddress:
      typeof raw.deliveryAddress === 'string' ? raw.deliveryAddress : undefined,
    paymentMethod,
  };

  if (order.items.length === 0 && order.total > 0) {
    order.items = [
      {
        id: `${id}-total`,
        productName: 'Order',
        quantity: 1,
        price: order.total,
        image: '/placeholder.svg',
      },
    ];
  }

  return order;
}

/**
 * Parses Spring Page (`content`), raw array, or `{ orders | data }`.
 */
export function normalizeOrdersPayload(raw: unknown): Order[] {
  if (!raw) {
    return [];
  }

  let rows: unknown[] = [];

  if (Array.isArray(raw)) {
    rows = raw;
  } else if (isRecord(raw)) {
    if (Array.isArray(raw.payload)) {
      rows = raw.payload;
    } else if (Array.isArray(raw.content)) {
      rows = raw.content;
    } else if (Array.isArray(raw.orders)) {
      rows = raw.orders;
    } else if (Array.isArray(raw.data)) {
      rows = raw.data;
    } else if (Array.isArray(raw.items)) {
      rows = raw.items;
    }
  }

  const out: Order[] = [];
  for (const row of rows) {
    const o = normalizeOneOrder(row);
    if (o) {
      out.push(o);
    }
  }

  return out;
}
