/** UI filter chips on `/admin/orders` → `GET .../admin/orders?status=` */
export type AdminOrderStatusFilter = 'all' | 'pending' | 'dispatched' | 'completed';

export function adminOrderFilterToQuery(status: AdminOrderStatusFilter): string | undefined {
  if (status === 'all') {
    return undefined;
  }
  if (status === 'pending') {
    return 'PENDING';
  }
  if (status === 'dispatched') {
    return 'SHIPPED';
  }
  if (status === 'completed') {
    return 'COMPLETED';
  }
  return undefined;
}

/** Values sent with `PATCH .../orders/{id}/status` (matches backend examples). */
export type PatchOrderStatusValue = 'pending' | 'shipped' | 'completed';

export function apiOrderStatusToPatchValue(apiStatus: string): PatchOrderStatusValue {
  const u = apiStatus.toUpperCase();
  if (u.includes('SHIP') || u.includes('DISPATCH')) {
    return 'shipped';
  }
  if (u.includes('PAID') || u.includes('COMPLETE') || u.includes('DELIVER')) {
    return 'completed';
  }
  return 'pending';
}

export function formatAdminCurrency(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function chartMonthLabel(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, { month: 'short' });
    }
  } catch {
    /* ignore */
  }
  return isoDate.slice(0, 7);
}
